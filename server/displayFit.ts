import { assessFit, assessSizes, type FitBody, type GarmentMeasurements, type GarmentSizeOption, type StretchLevel } from "../shared/fitEngine";
export function displayFit(body: FitBody, product: {category:string;garmentMeasurements?:GarmentMeasurements|null;sizeOptions?:GarmentSizeOption[]|null;stretchLevel?:StretchLevel;fit?:string|null}) {
  const sizes=assessSizes(body,product.sizeOptions,product.category,product.stretchLevel??"low",product.fit??"regular");
  const measured=sizes.assessments.filter(x=>x.assessment.easeCm!==null);
  const assessment=measured.length ? [...measured].sort((a,b)=>b.assessment.score-a.assessment.score)[0].assessment : assessFit(body,product.garmentMeasurements,product.category,product.stretchLevel??"low",product.fit??"regular");
  return {assessment,measured:assessment.easeCm!==null,rankBonus:assessment.easeCm===null ? 0 : (assessment.score-65)/2,recommendedSize:sizes.recommendedSize};
}
