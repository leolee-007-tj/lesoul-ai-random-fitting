import AppHeader from "@/components/AppHeader";
import { trpc } from "@/lib/trpc";
import { AlertCircle, CheckCircle2, ImagePlus, Link, LoaderCircle, Pencil, Plus, Trash2, UploadCloud, X } from "lucide-react";
import { ChangeEvent, FormEvent, useRef, useState } from "react";

type ProductForm = {
  name: string;
  category: "top" | "bottom" | "outer" | "dress" | "shoes" | "bag";
  season: string;
  color: string;
  style: string;
  status: "in_stock" | "sold_out";
  price: number;
  imageUrl: string;
  description: string;
  purchaseUrl: string;
};

const blank: ProductForm = {
  name: "", category: "top", season: "Spring, Fall", color: "Ivory", style: "MINIMAL", status: "in_stock", price: 99000,
  imageUrl: "/manus-storage/minimalist-lookbook_87fea9ec.jpg", description: "A new LESOUL piece.", purchaseUrl: "",
};

function readFileData(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Unable to read this image."));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

export default function ProductManager() {
  const [form, setForm] = useState<ProductForm | null>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const catalog = trpc.admin.products.useQuery();
  const utils = trpc.useUtils();
  const refresh = () => utils.admin.products.invalidate();
  const uploadImage = trpc.uploads.productImage.useMutation();
  const create = trpc.admin.createProduct.useMutation({ onSuccess: () => { refresh(); closeEditor(); } });
  const update = trpc.admin.updateProduct.useMutation({ onSuccess: () => { refresh(); closeEditor(); } });
  const remove = trpc.admin.deleteProduct.useMutation({ onSuccess: refresh });

  function closeEditor() {
    setForm(null); setEditing(null); setLocalPreview(null); setImageError("");
  }

  function openNewProduct() {
    setEditing(null); setLocalPreview(null); setImageError(""); setForm(blank);
  }

  function openEditProduct(item: Omit<ProductForm, "purchaseUrl"> & { id: number; purchaseUrl: string | null }) {
    setEditing(item.id); setLocalPreview(null); setImageError("");
    setForm({
      name: item.name, category: item.category, season: item.season, color: item.color, style: item.style, status: item.status,
      price: item.price, imageUrl: item.imageUrl, description: item.description, purchaseUrl: item.purchaseUrl ?? "",
    });
  }

  async function onImageFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !form) return;
    setImageError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setImageError("Choose a JPG, PNG, or WEBP image."); return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setImageError("Image size must be 8MB or smaller."); return;
    }
    try {
      const dataUrl = await readFileData(file);
      setLocalPreview(dataUrl);
      const { url } = await uploadImage.mutateAsync({ dataUrl });
      setForm((current) => current ? { ...current, imageUrl: url } : current);
      setLocalPreview(null);
    } catch (cause) {
      setImageError(cause instanceof Error ? cause.message : "Unable to upload image. Please try again.");
      setLocalPreview(null);
    } finally {
      event.target.value = "";
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!form || uploadImage.isPending) return;
    const payload = { ...form, purchaseUrl: form.purchaseUrl || null };
    if (editing) update.mutate({ id: editing, ...payload }); else create.mutate(payload);
  }

  return <div className="min-h-screen bg-[#f8f7f4] text-[#171717]">
    <AppHeader />
    <main className="mx-auto max-w-6xl px-5 pb-14 pt-8 sm:px-8">
      <p className="text-xs font-bold tracking-[.2em] text-[#777]">PRIVATE PRODUCT ARCHIVE</p>
      <div className="mt-2 flex items-center justify-between gap-4">
        <div><h1 className="font-serif text-4xl sm:text-5xl">Product Manager</h1><p className="mt-2 text-sm text-[#666]">Upload real LESOUL product images and build your private lookbook.</p></div>
        <button onClick={openNewProduct} className="inline-flex shrink-0 items-center gap-2 rounded-full bg-black px-4 py-3 text-xs font-semibold text-white"><Plus size={15} /> Add Product</button>
      </div>
      <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {catalog.isLoading ? <div className="col-span-full grid min-h-52 place-items-center"><LoaderCircle className="animate-spin" /></div> : catalog.data?.map((item) => <article key={item.id} className="overflow-hidden rounded-2xl border border-[#dedbd4] bg-white">
          <img src={item.imageUrl} alt={item.name} className="aspect-[1.25] w-full object-cover" />
          <div className="p-4"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="truncate text-sm font-semibold">{item.name}</p><p className="mt-1 text-[11px] font-bold tracking-[.12em] text-[#777]">{item.category.toUpperCase()} · {item.status === "in_stock" ? "ACTIVE" : "INACTIVE"}</p></div><div className="flex gap-1"><button onClick={() => openEditProduct(item)} className="grid size-8 place-items-center rounded-full bg-[#eeebe5]" aria-label={`Edit ${item.name}`}><Pencil size={14} /></button><button onClick={() => { if (confirm("Delete this product?")) remove.mutate({ id: item.id }); }} className="grid size-8 place-items-center rounded-full bg-[#f5e4df] text-[#9b4d3f]" aria-label={`Delete ${item.name}`}><Trash2 size={14} /></button></div></div></div>
        </article>)}
      </section>
      {form && <div className="fixed inset-0 z-40 overflow-y-auto bg-black/30 p-4 backdrop-blur-sm">
        <form onSubmit={submit} className="mx-auto my-6 max-w-xl rounded-[1.7rem] bg-white p-6 shadow-2xl">
          <div className="flex items-center justify-between"><div><p className="text-[10px] font-bold tracking-[.16em] text-[#777]">LESOUL CATALOG</p><h2 className="mt-1 font-serif text-2xl">{editing ? "Edit Product" : "Add Product"}</h2></div><button type="button" onClick={closeEditor} aria-label="Close product editor"><X size={20} /></button></div>
          <section className="mt-5 overflow-hidden rounded-2xl border border-[#dedbd4] bg-[#f8f7f4]">
            <div className="relative aspect-[1.65] bg-[#e9e6df]"><img src={localPreview ?? form.imageUrl} alt="Selected product preview" className={`h-full w-full object-cover ${uploadImage.isPending ? "opacity-55" : ""}`} />{uploadImage.isPending && <div className="absolute inset-0 grid place-items-center bg-black/25 text-center text-white"><LoaderCircle className="mx-auto animate-spin" /><p className="mt-2 text-xs font-semibold">Uploading product image…</p></div>}</div>
            <div className="flex flex-wrap items-center justify-between gap-3 p-3"><div className="min-w-0"><p className="text-xs font-semibold">Product Image</p><p className="mt-0.5 text-[11px] text-[#777]">JPG, PNG or WEBP · up to 8MB</p></div><button type="button" disabled={uploadImage.isPending} onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-2 rounded-full bg-black px-3.5 py-2 text-xs font-semibold text-white disabled:opacity-50"><ImagePlus size={15} /> {editing ? "Replace Image" : "Upload Image"}</button></div>
            <input ref={fileInputRef} onChange={onImageFile} className="hidden" type="file" accept="image/jpeg,image/png,image/webp" />
          </section>
          {imageError && <p className="mt-2 flex items-center gap-1.5 text-xs text-red-700"><AlertCircle size={14} />{imageError}</p>}
          {!uploadImage.isPending && form.imageUrl.startsWith("/manus-storage/lesoul/catalog/products/") && <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-700"><CheckCircle2 size={14} />Product image is safely stored in the LESOUL catalog.</p>}
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {([['name','Product Name'],['season','Season'],['color','Color'],['style','Style'],['price','Price'],['description','Description'],['purchaseUrl','Purchase URL']] as const).map(([key,label]) => <label key={key} className={key === 'description' || key === 'purchaseUrl' ? 'sm:col-span-2' : ''}><span className="text-xs font-semibold text-[#666]">{label}</span><input required={key !== 'purchaseUrl'} type={key === 'price' ? 'number' : 'text'} value={form[key]} onChange={(event) => setForm({ ...form, [key]: key === 'price' ? Number(event.target.value) : event.target.value })} className="mt-1 w-full rounded-xl border border-[#dedbd4] px-3 py-2.5 text-sm" /></label>)}
          </div>
          <label className="mt-3 block"><span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#666]"><Link size={13} />Or use an existing image URL</span><input type="url" value={form.imageUrl} onChange={(event) => { setLocalPreview(null); setForm({ ...form, imageUrl: event.target.value }); }} className="mt-1 w-full rounded-xl border border-[#dedbd4] px-3 py-2.5 text-sm" /></label>
          <div className="mt-3 grid grid-cols-2 gap-3"><label><span className="text-xs font-semibold text-[#666]">Category</span><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as ProductForm['category'] })} className="mt-1 w-full rounded-xl border border-[#dedbd4] px-3 py-2.5 text-sm">{["top","bottom","outer","dress","shoes","bag"].map((item) => <option key={item} value={item}>{item.toUpperCase()}</option>)}</select></label><label><span className="text-xs font-semibold text-[#666]">Status</span><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as ProductForm['status'] })} className="mt-1 w-full rounded-xl border border-[#dedbd4] px-3 py-2.5 text-sm"><option value="in_stock">ACTIVE</option><option value="sold_out">INACTIVE</option></select></label></div>
          <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-black py-3.5 text-sm font-semibold text-white disabled:opacity-50" disabled={create.isPending || update.isPending || uploadImage.isPending}>{create.isPending || update.isPending ? <LoaderCircle className="animate-spin" size={16} /> : <UploadCloud size={16} />} Save Product</button>
        </form>
      </div>}
    </main>
  </div>;
}
