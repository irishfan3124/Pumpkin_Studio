export function buildPumpkin(lib, p, contours) {
  const {Manifold:M,Mesh,CrossSection:C}=lib;
  const allocated=[]; const keep=x=>(allocated.push(x),x);
  try {
    const raw=keep(keep(M.sphere(1,144)).warp(v=>{
      const z=Math.max(-1,Math.min(1,v[2])),s=Math.sqrt(1-z*z),a=Math.atan2(v[1],v[0]);
      const groove=Math.pow((1+Math.cos(p.ribs*a+.18*Math.sin(3*a)))/2,3);
      const r=Math.pow(s,.80)*(1-.105*groove)*(1+.018*Math.sin(3*a+.5)*s);
      v[0]=r*Math.cos(a);v[1]=r*Math.sin(a);v[2]=z*(1-.09*Math.exp(-s*s/.055));
    }));
    const rb=raw.boundingBox();const scale=[p.width/(rb.max[0]-rb.min[0]),p.width/(rb.max[0]-rb.min[0]),p.height/(rb.max[2]-rb.min[2]-.055)];
    const outer0=keep(keep(raw.translate([0,0,-rb.min[2]-.055])).scale(scale));
    const mesh=outer0.getMesh();const pos=mesh.vertProperties;const ind=mesh.triVerts;const n=new Float64Array(pos.length);
    for(let t=0;t<ind.length;t+=3){const a=ind[t]*3,b=ind[t+1]*3,c=ind[t+2]*3;const ux=pos[b]-pos[a],uy=pos[b+1]-pos[a+1],uz=pos[b+2]-pos[a+2],vx=pos[c]-pos[a],vy=pos[c+1]-pos[a+1],vz=pos[c+2]-pos[a+2];const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;for(const k of [a,b,c]){n[k]+=nx;n[k+1]+=ny;n[k+2]+=nz;}}
    const inside=new Float32Array(pos.length);for(let k=0;k<pos.length;k+=3){const len=Math.hypot(n[k],n[k+1],n[k+2]);for(let d=0;d<3;d++)inside[k+d]=pos[k+d]-p.wall*n[k+d]/len;}
    const inner0=keep(new M(new Mesh({numProp:3,vertProperties:inside,triVerts:ind})));
    const outer=keep(outer0.trimByPlane([0,0,1],0));const inner=keep(inner0.trimByPlane([0,0,1],p.wall));
    const shell=keep(outer.subtract(inner));const cut=p.height*.805;
    let [lid,body]=shell.splitByPlane([0,0,1],cut);keep(lid);keep(body);
    const opening=keep(inner.slice(cut));const lipOuter=keep(opening.offset(-p.clearance));const lipInner=keep(lipOuter.offset(-Math.min(p.wall,2.5)));
    const lipRing=keep(lipOuter.subtract(lipInner));const lip=keep(keep(lipRing.extrude(5.5)).translate([0,0,cut-4]));
    const shoulder=keep(outer.slice(cut+.8));const bridge=keep(shoulder.subtract(lipInner));const bridge3=keep(keep(bridge.extrude(1.5)).translate([0,0,cut+.2]));
    const topCenter=(.91-rb.min[2]-.055)*scale[2];const stemHeight=p.height*.20;const stemR=p.width*.047;
    const stem=keep(keep(M.cylinder(stemHeight,stemR,stemR*.6,48)).warp(v=>{const t=v[2]/stemHeight;const a=Math.atan2(v[1],v[0]);const ridges=1+.10*Math.cos(5*a+t);v[0]=v[0]*ridges+p.width*.042*t*t;v[1]=v[1]*ridges+p.width*.018*Math.sin(t*2);v[2]+=topCenter-2;}));
    lid=keep(M.union([lid,lip,bridge3,stem]));
    if(contours.length){
      const fw=p.width*p.faceScale/100,fh=p.height*.51*p.faceScale/65;
      const polygons=contours.map(loop=>loop.map(([x,y])=>[(x-.5)*fw,(.5-y)*fh+p.height*.435+3+p.faceY]));
      const face=keep(new C(polygons,'EvenOdd'));const cutter=keep(keep(face.extrude(p.width)).rotate([90,0,0]));
      body=keep(body.subtract(cutter));
    }
    for(const [name,part] of [['body',body],['lid',lid]])if(part.status()!=='NoError'||part.isEmpty())throw Error(`The ${name} could not be generated. Try a simpler face or smaller cutouts.`);
    const parts=body.decompose();const count=parts.length;parts.forEach(x=>x.delete());
    const lidParts=lid.decompose();const lidCount=lidParts.length;lidParts.forEach(x=>x.delete());
    const bb=keep(M.union([body,lid])).boundingBox();const ob=opening.bounds();
    return {body:pack(body.getMesh()),lid:pack(lid.getMesh()),stem:pack(stem.getMesh()),stats:{triangles:body.numTri()+lid.numTri(),volume:(body.volume()+lid.volume())/1000,components:count,lidComponents:lidCount,dimensions:bb.max.map((v,i)=>v-bb.min[i]),opening:Math.min(ob.max[0]-ob.min[0],ob.max[1]-ob.min[1]),cut}};
  }finally{for(let i=allocated.length-1;i>=0;i--)allocated[i].delete();}
}
function pack(mesh){const p=new Float32Array(mesh.numVert*3);for(let i=0;i<mesh.numVert;i++)for(let j=0;j<3;j++)p[i*3+j]=mesh.vertProperties[i*mesh.numProp+j];return {positions:p,indices:new Uint32Array(mesh.triVerts)};}
export function binarySTL(mesh){const {positions:p,indices:ind}=mesh;const out=new ArrayBuffer(84+ind.length/3*50),v=new DataView(out);v.setUint32(80,ind.length/3,true);let offset=84;for(let i=0;i<ind.length;i+=3){const a=ind[i]*3,b=ind[i+1]*3,c=ind[i+2]*3;const u=[p[b]-p[a],p[b+1]-p[a+1],p[b+2]-p[a+2]],w=[p[c]-p[a],p[c+1]-p[a+1],p[c+2]-p[a+2]];const n=[u[1]*w[2]-u[2]*w[1],u[2]*w[0]-u[0]*w[2],u[0]*w[1]-u[1]*w[0]],length=Math.hypot(...n)||1;for(let k=0;k<3;k++)v.setFloat32(offset+k*4,n[k]/length,true);offset+=12;for(const vert of [a,b,c])for(let k=0;k<3;k++){v.setFloat32(offset,p[vert+k],true);offset+=4;}offset+=2;}return new Uint8Array(out);}
