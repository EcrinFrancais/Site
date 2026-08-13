import React from 'react';
import { useTranslation } from 'react-i18next';
import { coffretCadeauConfig } from '../data/coffretCadeauConfig';

export default function CoffretCadeauConfigurationPanel({
  styles,
  name,
  setName,
  taille,
  setTaille,
  mesures,
  setMesures,
  essence,
  setEssence,
  finition,
  setFinition,
  couleurLaque,
  setCouleurLaque,
  doublure,
  setDoublure,
  couleurVelours,
  setCouleurVelours,
  fermeture,
  setFermeture,
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
  texteGravure,
  setTexteGravure,
  modeGravure,
  setModeGravure,
  handleUploadImage,
  gravureUploadState,
  gravureFichierNom,
  quote,
  onOrder,
  orderPending,
  onSaveDraft,
  draftSaveState,
  title,
}) {
  const { t } = useTranslation(['giftBoxConfigurator', 'configurator']);

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
              <h2 style={styles.sectionTitle}>{t('configurator:sections.sizeFinish')}</h2>
            </div>
          </div>
          <div style={styles.sectionGrid}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>{t('configurator:labels.boxSize')}</label>
              <select value={taille} onChange={(e) => setTaille(e.target.value)} style={styles.minimalSelect}>
                {coffretCadeauConfig.tailles.map((tItem) => (
                  <option key={tItem.id} value={tItem.id}>
                    {t(`tailles.${tItem.id}`, tItem.label)}
                  </option>
                ))}
              </select>
              {taille === 'sur_mesure' && (
                <div style={styles.inlineInputs}>
                  <input
                    type="number"
                    placeholder={t('configurator:labels.lengthPlaceholder')}
                    value={mesures.L}
                    onChange={(e) => setMesures({ ...mesures, L: e.target.value })}
                    style={styles.minimalInput}
                  />
                  <input
                    type="number"
                    placeholder={t('configurator:labels.widthPlaceholder')}
                    value={mesures.l}
                    onChange={(e) => setMesures({ ...mesures, l: e.target.value })}
                    style={styles.minimalInput}
                  />
                  <input
                    type="number"
                    placeholder={t('configurator:labels.heightPlaceholder')}
                    value={mesures.h}
                    onChange={(e) => setMesures({ ...mesures, h: e.target.value })}
                    style={styles.minimalInput}
                  />
                </div>
              )}
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>{t('configurator:labels.wood')}</label>
              <select value={essence} onChange={(e) => setEssence(e.target.value)} style={styles.minimalSelect}>
                {coffretCadeauConfig.essences.map((b) => (
                  <option key={b} value={b}>
                    {t(`configurator:essences.${b}`, b)}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>{t('configurator:labels.finish')}</label>
              <select value={finition} onChange={(e) => setFinition(e.target.value)} style={styles.minimalSelect}>
                {coffretCadeauConfig.finitions.map((f) => (
                  <option key={f} value={f}>
                    {t(`configurator:finitions.${f}`, f)}
                  </option>
                ))}
              </select>
              {finition === 'Laque' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px', flexWrap: 'wrap' }}>
                  <label style={styles.label}>{t('configurator:labels.color')}</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['#800020', '#000000', '#ffffff', '#003366', '#214e34'].map((color) => (
                      <button
                        key={color}
                        onClick={() => setCouleurLaque(color)}
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          backgroundColor: color,
                          border: couleurLaque === color ? '2px solid #d4af37' : '1px solid #333',
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      />
                    ))}
                  </div>
                  <input
                    type="color"
                    value={couleurLaque}
                    onChange={(e) => setCouleurLaque(e.target.value)}
                    style={styles.colorPicker}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={styles.sectionCard}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>{t('sections.doublure')}</h2>
            </div>
          </div>
          <div style={styles.sectionGrid}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>{t('labels.doublureType')}</label>
              <select value={doublure} onChange={(e) => setDoublure(e.target.value)} style={styles.minimalSelect}>
                {coffretCadeauConfig.doublures.map((d) => (
                  <option key={d} value={d}>
                    {t(`doublureOptions.${d}`, d)}
                  </option>
                ))}
              </select>
              {doublure === 'Velours' && (
                <select
                  value={couleurVelours}
                  onChange={(e) => setCouleurVelours(e.target.value)}
                  style={{ ...styles.minimalSelect, marginTop: '6px' }}
                >
                  {coffretCadeauConfig.veloursColors.map((c) => (
                    <option key={c} value={c}>
                      {t(`configurator:veloursColors.${c}`, c)}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        <div style={styles.sectionCard}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>{t('configurator:sections.closure')}</h2>
            </div>
          </div>
          <div style={styles.sectionGrid}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>{t('configurator:labels.closureType')}</label>
              <select value={fermeture} onChange={(e) => setFermeture(e.target.value)} style={styles.minimalSelect}>
                {coffretCadeauConfig.fermetures.map((f) => (
                  <option key={f} value={f}>
                    {t(`configurator:fermetures.${f}`, f)}
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
                {coffretCadeauConfig.gravureTypes.map((g) => (
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
                      <select value={fontStyle} onChange={(e) => setFontStyle(e.target.value)} style={styles.minimalSelect}>
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
                  {gravureUploadState === 'uploading' && (
                    <span style={{ fontSize: '0.75rem', color: '#948a76' }}>{t('configurator:labels.engravingUploading')}</span>
                  )}
                  {gravureUploadState === 'done' && (
                    <span style={{ fontSize: '0.75rem', color: '#7fae7f' }}>{t('configurator:labels.engravingUploaded', { name: gravureFichierNom })}</span>
                  )}
                  {gravureUploadState === 'error' && (
                    <span style={{ fontSize: '0.75rem', color: '#d88b7c' }}>{t('configurator:labels.engravingUploadError')}</span>
                  )}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
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
          <div style={{ color: '#d4af37', fontSize: '0.9rem' }}>{t('configurator:footerHint')}</div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              style={{ ...styles.secondaryButton, opacity: draftSaveState === 'saving' ? 0.6 : 1 }}
              onClick={onSaveDraft}
              disabled={draftSaveState === 'saving'}
            >
              {draftSaveState === 'saving' && t('configurator:savingDraft')}
              {draftSaveState === 'saved' && t('configurator:draftSaved')}
              {draftSaveState === 'idle' && t('configurator:saveDraft')}
            </button>
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
    </div>
  );
}
