import React from 'react';
import { useTranslation } from 'react-i18next';
import { bijouxConfig, getSousTypesForFamille } from '../data/bijouxConfig';

export default function JewelryConfigurationPanel({
  styles,
  name,
  setName,
  famille,
  setFamille,
  sousType,
  setSousType,
  formeGenerale,
  setFormeGenerale,
  essence,
  setEssence,
  finition,
  setFinition,
  couleurVelours,
  setCouleurVelours,
  gravureType,
  setGravureType,
  fontStyle,
  setFontStyle,
  tailleTexte,
  setTailleTexte,
  tailleImage,
  setTailleImage,
  posX,
  setPosX,
  posY,
  setPosY,
  quantite,
  setQuantite,
  viewSize,
  setViewSize,
  texteGravure,
  setTexteGravure,
  modeGravure,
  setModeGravure,
  handleUploadImage,
  quote,
  onOrder,
  orderPending,
  title,
}) {
  const { t } = useTranslation(['jewelryConfigurator', 'configurator']);
  const sousTypesDisponibles = getSousTypesForFamille(famille);

  return (
    <div style={styles.leftPanel}>
      <div style={styles.configContainer}>
        <h1 style={styles.title}>{title}</h1>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>{t('configurator:labels.projectName')}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('configurator:labels.projectNamePlaceholder')}
            style={styles.minimalInput}
          />
        </div>

        <div style={{ ...styles.sectionCard, paddingTop: '16px' }}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>{t('sections.type')}</h2>
            </div>
          </div>
          <div style={styles.sectionGrid}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>{t('labels.famille')}</label>
              <select
                value={famille}
                onChange={(e) => {
                  const nextFamille = e.target.value;
                  setFamille(nextFamille);
                  const first = getSousTypesForFamille(nextFamille)[0];
                  if (first) setSousType(first.id);
                }}
                style={styles.minimalSelect}
              >
                {bijouxConfig.familles.map((f) => (
                  <option key={f.id} value={f.id}>
                    {t(`familles.${f.id}`, f.label)}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>{t('labels.sousType')}</label>
              <select
                value={sousType}
                onChange={(e) => setSousType(e.target.value)}
                style={styles.minimalSelect}
              >
                {sousTypesDisponibles.map((s) => (
                  <option key={s.id} value={s.id}>
                    {t(`sousTypes.${s.id}`, s.label)}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>{t('labels.formeGenerale')}</label>
              <select
                value={formeGenerale}
                onChange={(e) => setFormeGenerale(e.target.value)}
                style={styles.minimalSelect}
              >
                {bijouxConfig.formesGenerales.map((forme) => (
                  <option key={forme.id} value={forme.id}>
                    {t(`formesGenerales.${forme.id}`, forme.label)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div style={styles.sectionCard}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>{t('sections.materiau')}</h2>
            </div>
          </div>
          <div style={styles.sectionGrid}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>{t('configurator:labels.wood')}</label>
              <select
                value={essence}
                onChange={(e) => setEssence(e.target.value)}
                style={styles.minimalSelect}
              >
                {bijouxConfig.essences.map((b) => (
                  <option key={b} value={b}>
                    {t(`configurator:essences.${b}`, b)}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>{t('configurator:labels.finish')}</label>
              <select
                value={finition}
                onChange={(e) => setFinition(e.target.value)}
                style={styles.minimalSelect}
              >
                {bijouxConfig.finitions.map((f) => (
                  <option key={f} value={f}>
                    {t(`configurator:finitions.${f}`, f)}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>{t('labels.doublure')}</label>
              <select
                value={couleurVelours}
                onChange={(e) => setCouleurVelours(e.target.value)}
                style={styles.minimalSelect}
              >
                {bijouxConfig.veloursColors.map((c) => (
                  <option key={c} value={c}>
                    {t(`configurator:veloursColors.${c}`, c)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div style={styles.sectionCard}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>{t('configurator:sections.engraving')}</h2>
            </div>
          </div>
          <div style={styles.sectionGrid}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>{t('configurator:labels.engravingType')}</label>
              <select
                value={gravureType}
                onChange={(e) => setGravureType(e.target.value)}
                style={styles.minimalSelect}
              >
                {bijouxConfig.gravureTypes.map((g) => (
                  <option key={g} value={g}>
                    {t(`configurator:gravureTypes.${g}`, g)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {gravureType !== 'Aucune' && (
            <div style={styles.engravingCard}>
              <label style={styles.label}>{t('configurator:labels.engravingCustomization')}</label>

              <div style={{ display: 'flex', gap: '10px', marginTop: '4px', marginBottom: '6px' }}>
                <button
                  onClick={() => setModeGravure('texte')}
                  style={{
                    ...styles.minimalSelect,
                    width: '50%',
                    padding: '8px 10px',
                    border: modeGravure === 'texte' ? '1px solid #d4af37' : '1px solid rgba(255,255,255,0.12)',
                  }}
                >
                  {t('configurator:labels.modeText')}
                </button>
                <button
                  onClick={() => setModeGravure('image')}
                  style={{
                    ...styles.minimalSelect,
                    width: '50%',
                    padding: '8px 10px',
                    border: modeGravure === 'image' ? '1px solid #d4af37' : '1px solid rgba(255,255,255,0.12)',
                  }}
                >
                  {t('configurator:labels.modeImage')}
                </button>
              </div>

              {modeGravure === 'texte' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input
                    type="text"
                    value={texteGravure}
                    onChange={(e) => setTexteGravure(e.target.value)}
                    placeholder={t('configurator:labels.textPlaceholder')}
                    style={styles.minimalInput}
                  />

                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ width: '48%', minWidth: '140px' }}>
                      <label style={{ ...styles.label, fontSize: '0.6rem' }}>
                        {t('configurator:labels.font')}
                      </label>
                      <select
                        value={fontStyle}
                        onChange={(e) => setFontStyle(e.target.value)}
                        style={styles.minimalSelect}
                      >
                        <option value="Serif">{t('configurator:labels.fontSerif')}</option>
                        <option value="SansSerif">{t('configurator:labels.fontSansSerif')}</option>
                        <option value="Script">{t('configurator:labels.fontScript')}</option>
                      </select>
                    </div>
                    <div style={{ width: '48%', minWidth: '140px' }}>
                      <label style={{ ...styles.label, fontSize: '0.6rem' }}>
                        {t('configurator:labels.textSize', { value: tailleTexte })}
                      </label>
                      <input
                        type="range"
                        min="30"
                        max="200"
                        value={tailleTexte}
                        onChange={(e) => setTailleTexte(e.target.value)}
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input
                    type="file"
                    accept="image/png, image/jpeg"
                    onChange={handleUploadImage}
                    style={{ ...styles.minimalInput, fontSize: '0.8rem', color: '#888' }}
                  />
                  <div>
                    <label style={{ ...styles.label, fontSize: '0.6rem' }}>
                      {t('configurator:labels.imageZoom', { value: tailleImage })}
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="300"
                      value={tailleImage}
                      onChange={(e) => setTailleImage(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              )}

              <div style={{ marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px' }}>
                <label style={{ ...styles.label, fontSize: '0.6rem' }}>
                  {t('configurator:labels.positionHorizontal')}
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={posX}
                  onChange={(e) => setPosX(e.target.value)}
                  style={{ width: '100%', marginBottom: '10px' }}
                />

                <label style={{ ...styles.label, fontSize: '0.6rem' }}>
                  {t('configurator:labels.positionVertical')}
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={posY}
                  onChange={(e) => setPosY(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          )}
        </div>

        <div style={styles.summaryCard}>
          <div>
            <div style={styles.summaryLabel}>{t('configurator:labels.quantity')}</div>
            <div style={styles.summaryValue}>{quantite}</div>
          </div>
          <div>
            <div style={styles.summaryLabel}>{t('configurator:labels.estimate')}</div>
            <div style={styles.summaryValue}>{quote.totalTTC} € TTC</div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <div style={styles.summaryLabel}>{t('configurator:labels.preview3d')}</div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              {['petit', 'moyen', 'grand'].map((value) => (
                <button
                  key={value}
                  onClick={() => setViewSize(value)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '999px',
                    border: viewSize === value ? '1px solid #d4af37' : '1px solid rgba(255,255,255,0.15)',
                    background: viewSize === value ? 'rgba(212, 175, 55, 0.16)' : 'transparent',
                    color: '#f7efe3',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    fontSize: '0.78rem',
                  }}
                >
                  {t(`configurator:viewSize.${value}`, value)}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={styles.summaryLabel}>{t('configurator:labels.qty')}</label>
            <input
              type="number"
              min="1"
              value={quantite}
              onChange={(e) => setQuantite(e.target.value)}
              style={{ ...styles.minimalInput, width: '70px', textAlign: 'center', padding: '8px 10px' }}
            />
          </div>
        </div>

        <div style={styles.footer}>
          <div style={{ color: '#d4af37', fontSize: '0.9rem' }}>
            {t('configurator:footerHint')}
          </div>
          <button
            style={{ ...styles.orderButton, opacity: orderPending ? 0.6 : 1, cursor: orderPending ? 'not-allowed' : 'pointer' }}
            onClick={onOrder}
            disabled={orderPending}
          >
            {orderPending ? t('configurator:sending') : t('configurator:addToCart')}
          </button>
        </div>
      </div>
    </div>
  );
}
