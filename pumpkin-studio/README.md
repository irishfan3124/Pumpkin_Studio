# Pumpkin Studio

A browser-based jack-o’-lantern designer hosted on GitHub Pages. Three.js renders the actual generated mesh, and Manifold performs hollowing and face subtraction in a Web Worker. No uploaded designs are sent to a server. The [project README](../README.md) explains every control, STL export, assembly, and deployment.

## Run

Install Node.js 22 or later, then run `npm install`, `npm run build`, and `npm run dev`. Open http://127.0.0.1:5173. Use `npm test` for mesh connectivity, manifold reconstruction, closed-edge checks, body/lid interference, square peg insertion and socket floor checks, recess diameter/depth and floor checks, binary STL serialization, and raster contour tests.

## Features

- High-resolution procedural irregular ribs (512 sphere segments; about 280,000 triangles at default settings), flattened base, curved stem, normal-offset hollow interior. More geometric samples improve STL curvature instead of only smoothing preview normals.
- SVG, PNG, JPEG, and WebP silhouette import with threshold and inversion controls. Uploads automatically crop blank margins and fit the selected artwork to the face area without changing its proportions. Threshold or inversion changes recalculate the crop; pumpkin dimension changes recalculate the fit. The size slider scales the artwork rather than its original image canvas.
- Searchable built-in faces, four text styles with a font-size slider, and adjustable width, height, rib count, face size/height, wall thickness, and lid clearance. The default lid clearance is 0.4 mm; a lower value gives a tighter fit.
- Live assembled, exploded-lid, and body views, orbit controls, and LED illumination preview.
- LED puck recess with adjustable diameter (20–100 mm, limited to 65% of pumpkin width) and depth (0–8 mm; 0 disables it). Default: 60 mm diameter, 2 mm depth. A reinforced circular platform preserves at least the selected wall thickness beneath the pocket; the platform rises when needed to fit larger pucks inside a small pumpkin.
- Separate binary STL body, lid, and stem, or a ZIP with all three files and printing notes.
- Stem square peg with a 0.6 mm tapered lead-in, 6 mm insertion length, 0.1 mm default socket clearance per side, and 0.3 mm bottom clearance. The socket has a reinforced boss and closed floor. Test fit and sand as needed; printer calibration determines how snug the fit will be. Small raised nubs on the back indicate the matching lid orientation.
- Detached-component detection blocks unsuitable exports.

## Design limits

The pumpkin is a procedural approximation of a natural pumpkin, not a scanned specimen. Wall thickness uses a normal-offset triangulated surface; curvature, base, and lid joint can affect local thickness. Check thin walls and overhangs in a slicer. Imported artwork is traced at 256 × 256 pixels, so very fine details and tiny islands should be simplified. SVGs must be self-contained shapes and paths. Artwork is projected through the front half of the pumpkin; preview placement before exporting. STL dimensions are millimeters.

The preview uses the same high-resolution meshes as the export. STL files retain their assembled coordinates; import them as separate objects and place each on the print bed in your slicer. Generation takes longer and STL downloads are larger at this resolution.

The 0.4 mm default lid clearance reflects a user's print tests. Fit still varies with material and printer calibration. Print a fit test and inspect supports. **Use battery-powered LEDs only, never an open flame.**
