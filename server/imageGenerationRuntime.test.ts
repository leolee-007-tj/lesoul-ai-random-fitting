import {afterEach,describe,it,expect,vi} from "vitest";
vi.mock("./storage",()=>({storagePut:vi.fn(async()=>({url:"/fixture.png",key:"fixture"}))}));
vi.mock("./_core/env",()=>({ENV:{forgeApiUrl:"https://fixture.invalid",forgeApiKey:"local-fixture-not-live"}}));
import {generateImage} from "./_core/imageGeneration";
import {storagePut} from "./storage";
afterEach(()=>{vi.unstubAllGlobals();vi.clearAllMocks();});
describe("bounded image generation",()=>{
 it("supplies a deadline and stores only a successful result",async()=>{const fetcher=vi.fn(async()=>new Response(JSON.stringify({image:{b64Json:Buffer.from("fixture").toString("base64"),mimeType:"image/png"}}),{status:200}));vi.stubGlobal("fetch",fetcher);await expect(generateImage({prompt:"fixture"})).resolves.toMatchObject({url:"/fixture.png"});expect(fetcher.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);expect(storagePut).toHaveBeenCalledOnce();});
 it("never retries provider failure or saves a failed image",async()=>{const fetcher=vi.fn(async()=>new Response("unavailable",{status:503}));vi.stubGlobal("fetch",fetcher);await expect(generateImage({prompt:"fixture"})).rejects.toThrow("503");expect(fetcher).toHaveBeenCalledOnce();expect(storagePut).not.toHaveBeenCalled();});
});
