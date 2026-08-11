import React from 'react';
import { useTranslation } from 'react-i18next';
import { resolveSwatchColor, resolveLiningColor } from '../data/materialSwatches';

const styles = {
  wrap: { display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' },
  swatch: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    border: '1px solid rgba(255,255,255,0.25)',
    position: 'relative',
    flexShrink: 0,
    boxShadow: 'inset 0 0 6px rgba(0,0,0,0.35)',
  },
  lining: {
    position: 'absolute',
    bottom: '-3px',
    right: '-3px',
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    border: '2px solid #0b0b0b',
  },
  chips: { display: 'flex', flexWrap: 'wrap', gap: '6px', flex: 1 },
  chip: {
    fontSize: '0.72rem',
    padding: '3px 10px',
    borderRadius: '999px',
    border: '1px solid rgba(212, 175, 55, 0.3)',
    color: '#dccfab',
    background: 'rgba(255,255,255,0.03)',
    whiteSpace: 'nowrap',
  },
  engraving: { fontSize: '0.78rem', color: '#b6ab8f', fontStyle: 'italic', marginTop: '4px' },
};

const JEWELRY_UNIVERS_ID = 'joaillerie-horlogerie';
const GIFT_BOX_UNIVERS_ID = 'coffret-cadeau';

export default function CartItemVisualSummary({ universId, values }) {
  const { t } = useTranslation(['configurator', 'jewelryConfigurator', 'giftBoxConfigurator']);

  if (!values) return null;

  const swatchColor = resolveSwatchColor(values);
  const liningHex = resolveLiningColor(values);

  const chips = [];

  if (universId === JEWELRY_UNIVERS_ID && values.famille) {
    chips.push(t(`jewelryConfigurator:familles.${values.famille}`, values.famille));
  }
  if (values.essence) {
    chips.push(t(`configurator:essences.${values.essence}`, values.essence));
  }
  if (values.finition) {
    chips.push(t(`configurator:finitions.${values.finition}`, values.finition));
  }
  if (universId === GIFT_BOX_UNIVERS_ID) {
    if (values.doublure && values.doublure !== 'Aucune') {
      chips.push(t(`giftBoxConfigurator:doublureOptions.${values.doublure}`, values.doublure));
    }
  } else if (values.cales === 'Velours') {
    chips.push(t('configurator:cales.Velours'));
  }
  if (values.couleurVelours) {
    chips.push(t(`configurator:veloursColors.${values.couleurVelours}`, values.couleurVelours));
  }
  if (values.fermeture) {
    chips.push(t(`configurator:fermetures.${values.fermeture}`, values.fermeture));
  }
  if (values.gravureType && values.gravureType !== 'Aucune') {
    chips.push(t(`configurator:gravureTypes.${values.gravureType}`, values.gravureType));
  }

  const engravingText =
    values.gravureType && values.gravureType !== 'Aucune' && values.modeGravure === 'texte' && values.texteGravure
      ? values.texteGravure
      : null;

  return (
    <div>
      <div style={styles.wrap}>
        <span style={{ ...styles.swatch, backgroundColor: swatchColor }}>
          {liningHex && <span style={{ ...styles.lining, backgroundColor: liningHex }} />}
        </span>
        <div style={styles.chips}>
          {chips.map((chip, index) => (
            <span key={index} style={styles.chip}>
              {chip}
            </span>
          ))}
        </div>
      </div>
      {engravingText && <div style={styles.engraving}>« {engravingText} »</div>}
    </div>
  );
}
