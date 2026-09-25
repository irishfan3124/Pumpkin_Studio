# Pumpkin Studio

Design and download a hollow, 3D-printable jack-o’-lantern in your browser. The pumpkin has a removable lid, a separately printable stem, and an optional pocket for an LED puck light. Uploaded artwork stays on your device.

**Use the app:** [Pumpkin Studio](https://irishfan3124.github.io/Pumpkin_Studio/)

## Design a pumpkin

1. **Choose a face.** Search the built-in face library and select a design, or choose **Blank** for a plain pumpkin. For your own cutout, type a message of up to 24 characters or upload an SVG, PNG, JPG, or WebP file (up to 10 MB). Dark parts of an image become holes. Use bold, connected shapes; tiny detached islands may not print.
2. **Customize text or an upload.** Typed text offers Bold block, Rounded, Classic serif, and Typewriter styles, plus a 50–150% font-size slider. Spaces and line breaks are supported, and the app adds small stencil bridges to enclosed letter shapes such as O and B. Uploaded images also get automatic bridges for enclosed areas, keeping those sections attached to the pumpkin; **Connect enclosed areas for printing** is on by default and can be turned off. For an upload, use **Cut out light areas instead** when the light parts should become holes, and adjust **Image threshold** to clean up the silhouette. Blank image margins are cropped automatically. **Rotate design** works with typed text and uploads.
3. **Place the cutout.** Use **Face size** and **Move face up / down** to set the cutout’s scale and position. The preview updates after each change.
4. **Shape the pumpkin.** Adjust width, body height, and the number of natural ribs.
5. **Tune the printable parts.** Set wall thickness, lid clearance, stem size, stem fit clearance, and LED recess dimensions. Lower lid or stem clearance makes that joint tighter. The default lid clearance is **0.4 mm**, based on a test print; check the fit on your own printer.
6. **Inspect and export.** Drag to rotate the 3D preview and scroll to zoom. Switch between **Assembled**, **Lift the lid**, and **Body only**; **Light it up** previews an LED inside. Use **Download STL files** for a ZIP containing the body, lid, stem, and printing notes, or download each STL separately.

| Setting | Range | Default |
| --- | --- | --- |
| Face size | 35–85% | 65% |
| Move face up / down | −12 to +12 mm | 0 mm |
| Width | 100–240 mm | 160 mm |
| Body height | 100–210 mm | 135 mm |
| Natural ribs | 7–14 | 10 |
| Wall thickness | 2–6 mm | 3 mm |
| Lid clearance | 0.2–0.8 mm | **0.4 mm** |
| Stem size | 70–200% | 125% |
| Stem fit clearance | 0.05–0.5 mm per side | 0.1 mm per side |
| LED recess diameter | 20–100 mm, limited by pumpkin width | 60 mm |
| LED recess depth | 0–8 mm; 0 turns it off | 2 mm |

The text font-size slider runs from 50–150% and starts at 100%. The design rotation slider runs from −180° to +180° and starts at 0°. **Reset to the original pumpkin** restores the starting settings.

## Print and assemble

Import the STL files into a slicer **in millimeters** as three separate objects. Their coordinates show the assembled model, so place each part on the print bed before slicing. Print the stem in another color if desired. The body has a flat base and hollow interior; check mouth and eye overhangs for supports. Inspect the sliced walls and test the lid and stem fits before a full print. The lid has a locating lip; line up the two small raised nubs on the **back** of the lid and body when placing it. Press the stem’s square peg into the lid socket after printing.

Measure your LED puck before setting the recess diameter and depth. Allow some diameter clearance; the app reinforces the base below the pocket. A warning and disabled export indicate that a design produces detached mesh pieces. Simplify the cutout or reduce its size, then regenerate.

**Use battery-powered LED lights only. Never place an open flame inside a plastic print.**

## Run locally

Install Node.js 22 or later, then run:

```sh
cd pumpkin-studio
npm install
npm run build
npm run dev
```

Open <http://127.0.0.1:5173/>. Run `npm test` to check the meshes, fit, and STL output. See [application details](pumpkin-studio/README.md) for implementation notes and design limits.

## Publish on GitHub Pages

Keep `.github/workflows/pages.yml` at the repository root and the app in `pumpkin-studio/`. In **Settings → Pages**, set the source to **GitHub Actions**. A push to `main` or `master` runs the tests, builds the site, and deploys it; **Publish Pumpkin Studio** can also be run from the Actions tab. The workflow publishes `pumpkin-studio/dist`. Relative URLs support a repository Pages URL or custom domain.
