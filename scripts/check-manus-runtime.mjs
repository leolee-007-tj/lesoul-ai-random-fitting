import "dotenv/config";
import mysql from "mysql2/promise";
import {pathToFileURL} from "node:url";
export const probes = [["products", "SELECT id, availabilityStatus, inventoryQuantity, garmentMeasurements FROM products LIMIT 0"], ["aiUsageEvents", "SELECT id, requestType, providerUsageMetadata FROM aiUsageEvents LIMIT 0"], ["displayLookbookImages", "SELECT id, compositionProductIds FROM displayLookbookImages LIMIT 0"]];
export async function checkRuntime(env, connect) {
  const result={database:[], configuration:{}, modelInference:"NOT_EXECUTED", storageRead:"NOT_EXECUTED", schemaWrites:0};
  for(const name of ["DATABASE_URL","JWT_SECRET","VITE_APP_ID","OAUTH_SERVER_URL","BUILT_IN_FORGE_API_URL","BUILT_IN_FORGE_API_KEY"])result.configuration[name]=env[name] ? "CONFIGURED_NOT_VERIFIED" : "MISSING";
  if(!env.DATABASE_URL)return result;
  let db;
  try{
    db=await connect(env.DATABASE_URL);
    for(const [name,query] of probes){try{await db.query(query);result.database.push({name,state:"PASS"});}catch{result.database.push({name,state:"SCHEMA_OR_PERMISSION_MISMATCH"});}}
  }catch{result.database.push({name:"connection",state:"CONNECTION_FAILED"});}
  finally{await db?.end();}
  return result;
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href){
 const result=await checkRuntime(process.env,url=>mysql.createConnection({uri:url,connectTimeout:10000}));
 console.log(JSON.stringify(result,null,2));
 if(result.database.some(x=>x.state!=="PASS")||Object.values(result.configuration).includes("MISSING"))process.exitCode=1;
}
