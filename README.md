## abap2UI5 - frontend renamed


#### Setup

check the ci/config.yaml:
```
# config.yaml
old_name: z2ui5
new_name: z2ui6
source_paths:
  - ../frontend/src/01
  - ../frontend/src/02
  - ../frontend/src/03
destination_path: ../src
exclude_patterns:
  - wapa
```
Because of BSP and ICF only short names are possible, tested for z2ui6, not sure if longer names possible

#### Rename
```
npm i
npm run rename
```
