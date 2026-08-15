// src/components/EngravingUploadStatus.jsx
//
// Message d'état sous le sélecteur de fichier de gravure, partagé par les
// trois configurateurs (vin, bijoux, coffret cadeau) qui utilisent
// useEngravingUpload — auparavant dupliqué à l'identique dans chacun des
// trois panneaux de configuration.
export default function EngravingUploadStatus({ t, gravureUploadState, gravureFichierNom }) {
  if (gravureUploadState === 'uploading') {
    return <span style={{ fontSize: '0.75rem', color: '#948a76' }}>{t('configurator:labels.engravingUploading')}</span>;
  }
  if (gravureUploadState === 'done') {
    return (
      <span style={{ fontSize: '0.75rem', color: '#7fae7f' }}>
        {t('configurator:labels.engravingUploaded', { name: gravureFichierNom })}
      </span>
    );
  }
  if (gravureUploadState === 'error') {
    return <span style={{ fontSize: '0.75rem', color: '#d88b7c' }}>{t('configurator:labels.engravingUploadError')}</span>;
  }
  return null;
}
