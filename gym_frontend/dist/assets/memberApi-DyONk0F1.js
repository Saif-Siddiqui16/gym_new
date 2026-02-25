import{a as t}from"./index-Dr4-eLQv.js";const s=async()=>{try{return(await t.get("/staff/members")).data}catch(e){throw e.response?.data?.message||"Failed to fetch members"}};export{s as getMembers};
