# Image Upload Field Usage Guide

The `CrudEntityPage` component now supports file and image upload fields.

## How to Use

### 1. Add an image field to your form fields configuration:

```javascript
const formFields = [
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'description', label: 'Description', type: 'text' },
  { key: 'logo', label: 'Logo', type: 'image', fullWidth: true },
  // ... other fields
];
```

### 2. Field Type Options

- `type: 'image'` - For image uploads with preview
- `type: 'file'` - Also works for image uploads (same behavior)

### 3. Features

- **File Selection**: Click the "Upload Image" button to select an image
- **Preview**: Selected images are displayed as a 120x120px preview
- **Change Image**: Button text changes to "Change Image" when an image is selected
- **Clear**: Delete button appears to clear the selected image
- **Base64 Encoding**: Images are automatically converted to base64 strings
- **Disabled State**: Respects the disabled prop (e.g., in view mode)

### 4. Field Configuration Options

```javascript
{
  key: 'photo',
  label: 'Profile Photo',
  type: 'image',
  fullWidth: true,  // Makes the field span multiple columns in the grid
  readOnly: false,  // Set to true to make it read-only
  readonlyOnEdit: false  // Set to true to make it read-only only when editing
}
```

### 5. Example Full Configuration

```javascript
const vehicleFormFields = [
  { key: 'vehicleName', label: 'Vehicle Name', type: 'text' },
  { key: 'registrationNumber', label: 'Registration #', type: 'text' },
  { key: 'vehicleType', label: 'Type', type: 'select', options: [...] },
  { key: 'vehicleImage', label: 'Vehicle Photo', type: 'image', fullWidth: true },
  { key: 'description', label: 'Description', type: 'text', fullWidth: true },
];
```

### 6. Data Handling

The image field value will be:
- A base64-encoded string when an image is selected: `"data:image/png;base64,iVBORw0KG..."`
- An empty string when cleared: `""`
- The existing value when editing a record with an image

### 7. Backend Integration

When saving, the base64 string is sent to your backend through the `createFetcher` or `updateFetcher` functions. You may want to:

```javascript
normalizePayload: (form, mode) => {
  const payload = { ...form };
  
  // Handle image field - ensure it's included in the payload
  // The base64 string can be stored directly or processed server-side
  
  return payload;
}
```

### 8. Display Images in Table

To display images in the table, use a custom render function:

```javascript
renderCell: (col, row) => {
  if (col.key === 'vehicleImage' && row.vehicleImage) {
    return (
      <Box
        component="img"
        src={row.vehicleImage}
        alt="Vehicle"
        sx={{ width: 40, height: 40, borderRadius: 1, objectFit: 'cover' }}
      />
    );
  }
  return null; // Let default rendering handle other columns
}
```

## Notes

- Maximum file size: 5MB (displayed in UI, but not enforced - add validation if needed)
- Accepted formats: image/* (all image types)
- Preview dimensions: 120x120px with cover object-fit
- Border: 2px solid with divider color
- The component uses FileReader API for base64 conversion
- Preview state is managed internally by the ImageUploadField component

## Full Example

```javascript
<CrudEntityPage
  title="Vehicles"
  icon={<DirectionsCarIcon />}
  gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  idKey="vehicleId"
  columns={[
    { key: 'vehicleName', label: 'Name' },
    { key: 'registrationNumber', label: 'Registration' },
    { key: 'vehicleImage', label: 'Photo' },
  ]}
  formFields={[
    { key: 'vehicleName', label: 'Vehicle Name', type: 'text' },
    { key: 'registrationNumber', label: 'Registration #', type: 'text' },
    { key: 'vehicleImage', label: 'Vehicle Photo', type: 'image', fullWidth: true },
  ]}
  emptyForm={{ vehicleName: '', registrationNumber: '', vehicleImage: '' }}
  normalizePayload={(form) => form}
  listFetcher={fetchVehicles}
  getByIdFetcher={fetchVehicleById}
  createFetcher={createVehicle}
  updateFetcher={updateVehicle}
  deleteFetcher={deleteVehicle}
  renderCell={(col, row) => {
    if (col.key === 'vehicleImage' && row.vehicleImage) {
      return (
        <Box
          component="img"
          src={row.vehicleImage}
          alt="Vehicle"
          sx={{ width: 40, height: 40, borderRadius: 1, objectFit: 'cover' }}
        />
      );
    }
  }}
/>
```
