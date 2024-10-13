## abap2UI5 - BSP renamed


#### Setup

check the ci/config.yaml:
```
# config.yaml
old_name: z2ui5
new_name: z2ui6
source_paths:
  - ../src_backup/01
  - ../src_backup/02
  - ../src_backup/03
destination_path: ../src
exclude_patterns:
  - wapa
```
Because of BSP and ICF only short names are possible, tested for z2ui6, not sure if longer names possible

#### Rename
```
node ./ci/copy_rename.js
```
