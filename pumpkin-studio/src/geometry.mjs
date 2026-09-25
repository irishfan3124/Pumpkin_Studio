export function buildPumpkin(lib, p, contours) {
  const {Manifold:M,Mesh,CrossSection:C}=lib;
  const allocated=[]; const keep=x=>(allocated.push(x),x);
  try {
    // Sample the curved surface more densely before warping (not just subdividing flat triangles).
    const raw=keep(keep(M.sphere(1,512)).warp(v=>{
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
    const stemScale=p.stemScale??125,stemClearance=p.stemClearance??.1;
    if(!Number.isFinite(stemScale)||stemScale<70||stemScale>200||!Number.isFinite(stemClearance)||stemClearance<.05||stemClearance>.5)throw Error('Choose a stem size from 70% to 200% and a stem clearance from 0.05 to 0.5 mm per side.');
    const topCenter=(.91-rb.min[2]-.055)*scale[2];const stemHeight=p.height*.20*stemScale/100;const stemR=p.width*.047*stemScale/100;
    const stemSeat=topCenter+1,pegWidth=Math.min(8,stemR*.85),pegDepth=6;
    const socketWidth=pegWidth+2*stemClearance;
    const bossRadius=Math.max(stemR*.86,socketWidth/Math.sqrt(2)+1.5);
    const boss=keep(keep(M.cylinder(pegDepth+2.3,bossRadius,bossRadius,128)).translate([0,0,stemSeat-pegDepth-2.3]));
    const socket=keep(keep(M.cube([socketWidth,socketWidth,pegDepth+.8])).translate([-socketWidth/2,-socketWidth/2,stemSeat-pegDepth-.3]));
    lid=keep(keep(M.union([lid,lip,bridge3,boss])).subtract(socket));
    // Multiple axial rings preserve the stem's bend and twist in the exported solid.
    const stemProfile=keep(C.circle(stemR,128));
    const curvedStem=keep(keep(stemProfile.extrude(stemHeight,64)).warp(v=>{
      const t=v[2]/stemHeight,a=Math.atan2(v[1],v[0]);
      // A broad flat tip with a rounded shoulder, instead of a thin, sharp rim.
      const rounding=Math.min(1.2,stemR*.2);
      const shoulder=Math.max(0,v[2]-(stemHeight-rounding));
      const inset=rounding-Math.sqrt(Math.max(0,rounding*rounding-shoulder*shoulder));
      const radiusScale=(stemR*(1-.28*t)-inset)/stemR;
      const fade=Math.min(1,Math.max(0,(1-t)/.18));
      const ridges=1+.10*fade*fade*(3-2*fade)*Math.cos(5*a+t);
      v[0]=v[0]*radiusScale*ridges+p.width*.042*t*t;
      v[1]=v[1]*radiusScale*ridges+p.width*.018*Math.sin(t*2);
      v[2]+=stemSeat;
    }));
    const peg=keep(keep(M.cube([pegWidth,pegWidth,pegDepth-.4])).translate([-pegWidth/2,-pegWidth/2,stemSeat-pegDepth+.6]));
    const tipProfile=keep(C.square(pegWidth-.6,true));
    const tip=keep(keep(tipProfile.extrude(.61,0,0,pegWidth/(pegWidth-.6))).translate([0,0,stemSeat-pegDepth]));
    const stem=keep(M.union([curvedStem,peg,tip]));
    if(contours.length){
      const fw=p.width*p.faceScale/100,fh=p.height*.51*p.faceScale/65;
      const polygons=contours.map(loop=>loop.map(([x,y])=>[(x-.5)*fw,(.5-y)*fh+p.height*.435+3+p.faceY]));
      const face=keep(new C(polygons,'EvenOdd'));const cutter=keep(keep(face.extrude(p.width)).rotate([90,0,0]));
      body=keep(body.subtract(cutter));
    }
    const recessDiameter=p.recessDiameter??60,recessDepth=p.recessDepth??2;
    if(!Number.isFinite(recessDiameter)||recessDiameter<20||recessDiameter>Math.min(100,p.width*.65)+.001||!Number.isFinite(recessDepth)||recessDepth<0||recessDepth>8)throw Error('Choose a recess diameter that fits this pumpkin and a depth from 0 to 8 mm.');
    let recessFloor=p.wall;
    if(recessDepth>0){
      const radius=recessDiameter/2,platformRadius=radius+Math.max(2,p.wall);
      const footprint=keep(C.circle(platformRadius,256));
      // Raise and reinforce the pocket as needed so its full diameter fits inside the shell.
      let fits=false;
      for(;recessFloor<p.height*.45;recessFloor+=.5){const section=inner.slice(recessFloor),outside=footprint.subtract(section);fits=outside.area()<.001;outside.delete();section.delete();if(fits)break;}
      if(!fits)throw Error('This light recess is too wide for the pumpkin. Reduce its diameter.');
      const platform=keep(M.cylinder(recessFloor+recessDepth,platformRadius,platformRadius,256));
      body=keep(body.add(keep(platform.intersect(outer))));
      const pocket=keep(keep(M.cylinder(recessDepth+.1,radius,radius,256)).translate([0,0,recessFloor]));
      body=keep(body.subtract(pocket));
    }
    // High-density Boolean seams can leave zero-volume numerical fragments.
    // Retain meaningful detached artwork so the export guard still catches it.
    const clean=solid=>{const pieces=solid.decompose();pieces.forEach(keep);const real=pieces.filter(x=>Math.abs(x.volume())>1e-4);return real.length===pieces.length?solid:keep(M.union(real));};
    body=clean(body);lid=clean(lid);
    for(const [name,part] of [['body',body],['lid',lid],['stem',stem]])if(part.status()!=='NoError'||part.isEmpty())throw Error(`The ${name} could not be generated. Try a simpler face or smaller cutouts.`);
    const parts=body.decompose();const count=parts.length;parts.forEach(x=>x.delete());
    const lidParts=lid.decompose();const lidCount=lidParts.length;lidParts.forEach(x=>x.delete());
    const stemParts=stem.decompose();const stemCount=stemParts.length;stemParts.forEach(x=>x.delete());
    const bb=keep(M.union([body,lid,stem])).boundingBox();const ob=opening.bounds();
    return {body:pack(body.getMesh()),lid:pack(lid.getMesh()),stem:pack(stem.getMesh()),stats:{triangles:body.numTri()+lid.numTri()+stem.numTri(),volume:(body.volume()+lid.volume()+stem.volume())/1000,components:count,lidComponents:lidCount,stemComponents:stemCount,dimensions:bb.max.map((v,i)=>v-bb.min[i]),opening:Math.min(ob.max[0]-ob.min[0],ob.max[1]-ob.min[1]),cut,recessDiameter,recessDepth,recessFloor,recessOccludesFace:recessDepth>0&&contours.some(loop=>loop.some(([,y])=>(.5-y)*p.height*.51*p.faceScale/65+p.height*.435+3+p.faceY<recessFloor+recessDepth)),stemSeat,pegWidth,pegDepth,stemClearance,socketWidth}};
  }finally{for(let i=allocated.length-1;i>=0;i--)allocated[i].delete();}
}
function pack(mesh){const p=new Float32Array(mesh.numVert*3);for(let i=0;i<mesh.numVert;i++)for(let j=0;j<3;j++)p[i*3+j]=mesh.vertProperties[i*mesh.numProp+j];return {positions:p,indices:new Uint32Array(mesh.triVerts)};}
export function binarySTL(mesh){const {positions:p,indices:ind}=mesh;const out=new ArrayBuffer(84+ind.length/3*50),v=new DataView(out);v.setUint32(80,ind.length/3,true);let offset=84;for(let i=0;i<ind.length;i+=3){const a=ind[i]*3,b=ind[i+1]*3,c=ind[i+2]*3;const u=[p[b]-p[a],p[b+1]-p[a+1],p[b+2]-p[a+2]],w=[p[c]-p[a],p[c+1]-p[a+1],p[c+2]-p[a+2]];const n=[u[1]*w[2]-u[2]*w[1],u[2]*w[0]-u[0]*w[2],u[0]*w[1]-u[1]*w[0]],length=Math.hypot(...n)||1;for(let k=0;k<3;k++)v.setFloat32(offset+k*4,n[k]/length,true);offset+=12;for(const vert of [a,b,c])for(let k=0;k<3;k++){v.setFloat32(offset,p[vert+k],true);offset+=4;}offset+=2;}return new Uint8Array(out);}
