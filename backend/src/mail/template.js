// template.js
const emailReinitialisation = (email, lien) => {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Réinitialisation du mot de passe</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=DM+Mono&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      background-color: #0a0a0f;
      font-family: 'DM Sans', sans-serif;
      color: #e2e8f0;
      padding: 40px 16px;
    }

    .wrapper {
      max-width: 520px;
      margin: 0 auto;
    }

    .card {
      background: #111118;
      border: 1px solid #1e1e2e;
      border-radius: 16px;
      overflow: hidden;
    }

    .header {
      background: linear-gradient(135deg, #0097FB11, #0097FB22);
      border-bottom: 1px solid #0097FB33;
      padding: 36px 40px 28px;
      text-align: center;
    }

    .icon {
      width: 48px;
      height: 48px;
      background: #0097FB15;
      border: 1px solid #0097FB44;
      border-radius: 12px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }

    .icon svg {
      width: 22px;
      height: 22px;
      stroke: #0097FB;
      fill: none;
      stroke-width: 1.8;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .header h1 {
      font-size: 18px;
      font-weight: 500;
      color: #f1f5f9;
      letter-spacing: -0.3px;
    }

    .body {
      padding: 32px 40px;
    }

    .body p {
      font-size: 14px;
      color: #94a3b8;
      line-height: 1.7;
      margin-bottom: 12px;
    }

    .email-badge {
      display: inline-block;
      font-family: 'DM Mono', monospace;
      font-size: 12px;
      color: #0097FB;
      background: #0097FB11;
      border: 1px solid #0097FB33;
      border-radius: 6px;
      padding: 4px 10px;
      margin: 4px 0 20px;
    }

    .btn {
      display: block;
      width: 100%;
      text-align: center;
      background: #0097FB;
      color: #ffffff;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      padding: 14px 24px;
      border-radius: 10px;
      margin: 24px 0;
      letter-spacing: 0.2px;
    }

    .divider {
      border: none;
      border-top: 1px solid #1e1e2e;
      margin: 24px 0;
    }

    .link-fallback p {
      font-size: 12px;
      color: #475569;
      margin-bottom: 8px;
    }

    .link-fallback a {
      font-family: 'DM Mono', monospace;
      font-size: 11px;
      color: #0097FB99;
      word-break: break-all;
      text-decoration: none;
    }

    .footer {
      border-top: 1px solid #1e1e2e;
      padding: 20px 40px;
      text-align: center;
    }

    .footer p {
      font-size: 11px;
      color: #334155;
      line-height: 1.6;
    }

    .expire-note {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #475569;
      background: #1e1e2e;
      border-radius: 6px;
      padding: 8px 12px;
      margin-top: 4px;
    }

    .dot {
      width: 6px;
      height: 6px;
      background: #f59e0b;
      border-radius: 50%;
      flex-shrink: 0;
    }

    @media (max-width: 480px) {
      .header, .body, .footer { padding-left: 24px; padding-right: 24px; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">

      <div class="header">
        <div class="icon">
          <svg viewBox="0 0 24 24">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <h1>Réinitialisation du mot de passe</h1>
      </div>

      <div class="body">
        <p>Une demande de réinitialisation a été reçue pour le compte :</p>
        <span class="email-badge">${email}</span>

        <p>Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe. Ce lien est à usage unique.</p>

        <a href="${lien}" class="btn">Réinitialiser mon mot de passe</a>

        <div class="expire-note">
          <span class="dot"></span>
          Ce lien expire dans <strong style="color:#94a3b8">&nbsp;15 minutes</strong>
        </div>

        <hr class="divider" />

        <div class="link-fallback">
          <p>Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :</p>
          <a href="${lien}">${lien}</a>
        </div>
      </div>

      <div class="footer">
        <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.<br/>
        Votre mot de passe restera inchangé.</p>
      </div>

    </div>
  </div>
</body>
</html>
    `;
};


// templateConfirmation.js
const emailConfirmationTemplate = (email) => {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Mot de passe modifié</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=DM+Mono&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      background-color: #0a0a0f;
      font-family: 'DM Sans', sans-serif;
      color: #e2e8f0;
      padding: 40px 16px;
    }

    .wrapper { max-width: 520px; margin: 0 auto; }

    .card {
      background: #111118;
      border: 1px solid #1e1e2e;
      border-radius: 16px;
      overflow: hidden;
    }

    .header {
      background: linear-gradient(135deg, #10b98111, #10b98122);
      border-bottom: 1px solid #10b98133;
      padding: 36px 40px 28px;
      text-align: center;
    }

    .icon {
      width: 52px;
      height: 52px;
      background: #10b98115;
      border: 1px solid #10b98144;
      border-radius: 14px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }

    .icon svg {
      width: 24px;
      height: 24px;
      stroke: #10b981;
      fill: none;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .header h1 {
      font-size: 18px;
      font-weight: 500;
      color: #f1f5f9;
      letter-spacing: -0.3px;
    }

    .header p {
      font-size: 13px;
      color: #64748b;
      margin-top: 6px;
    }

    .body { padding: 32px 40px; }

    .body p {
      font-size: 14px;
      color: #94a3b8;
      line-height: 1.7;
      margin-bottom: 12px;
    }

    .email-badge {
      display: inline-block;
      font-family: 'DM Mono', monospace;
      font-size: 12px;
      color: #0097FB;
      background: #0097FB11;
      border: 1px solid #0097FB33;
      border-radius: 6px;
      padding: 4px 10px;
      margin: 2px 0 20px;
    }

    .success-box {
      display: flex;
      align-items: center;
      gap: 12px;
      background: #10b98108;
      border: 1px solid #10b98130;
      border-radius: 10px;
      padding: 14px 16px;
      margin: 4px 0 20px;
    }

    .success-box .check {
      width: 32px;
      height: 32px;
      background: #10b98120;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .success-box .check svg {
      width: 16px;
      height: 16px;
      stroke: #10b981;
      fill: none;
      stroke-width: 2.5;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .success-box p {
      font-size: 13px;
      color: #10b981;
      margin: 0;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid #1e1e2e;
      font-size: 13px;
    }

    .info-row:last-child { border-bottom: none; }
    .info-row .label { color: #475569; }
    .info-row .value {
      font-family: 'DM Mono', monospace;
      color: #94a3b8;
      font-size: 12px;
    }

    .divider {
      border: none;
      border-top: 1px solid #1e1e2e;
      margin: 24px 0;
    }

    .warning-box {
      display: flex;
      gap: 10px;
      background: #f59e0b08;
      border: 1px solid #f59e0b25;
      border-radius: 10px;
      padding: 14px 16px;
      margin-top: 4px;
    }

    .warning-box svg {
      width: 16px;
      height: 16px;
      stroke: #f59e0b;
      fill: none;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .warning-box p {
      font-size: 12px;
      color: #b45309;
      margin: 0;
      line-height: 1.6;
    }

    .warning-box p a {
      color: #f59e0b;
      text-decoration: none;
    }

    .footer {
      border-top: 1px solid #1e1e2e;
      padding: 20px 40px;
      text-align: center;
    }

    .footer p {
      font-size: 11px;
      color: #334155;
      line-height: 1.6;
    }

    @media (max-width: 480px) {
      .header, .body, .footer { padding-left: 24px; padding-right: 24px; }
      .info-row { flex-direction: column; align-items: flex-start; gap: 4px; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">

      <div class="header">
        <div class="icon">
          <svg viewBox="0 0 24 24">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <h1>Mot de passe modifié</h1>
        <p>Votre compte est sécurisé</p>
      </div>

      <div class="body">
        <p>Le mot de passe associé au compte suivant a été modifié avec succès :</p>

        <span class="email-badge">${email}</span>

        <div class="success-box">
          <div class="check">
            <svg viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <p>Mot de passe mis à jour avec succès</p>
        </div>

        <div>
          <div class="info-row">
            <span class="label">Date</span>
            <span class="value">${new Date().toLocaleDateString("fr-FR", {
              day: "2-digit", month: "long", year: "numeric"
            })}</span>
          </div>
          <div class="info-row">
            <span class="label">Heure</span>
            <span class="value">${new Date().toLocaleTimeString("fr-FR", {
              hour: "2-digit", minute: "2-digit"
            })}</span>
          </div>
        </div>

        <hr class="divider" />

        <div class="warning-box">
          <svg viewBox="0 0 24 24">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <p>
            Si vous n'êtes pas à l'origine de cette modification,
            contactez immédiatement votre administrateur.
          </p>
        </div>
      </div>

      <div class="footer">
        <p>Cet email a été envoyé automatiquement par GestHSup.<br/>
        Ne pas répondre à ce message.</p>
      </div>

    </div>
  </div>
</body>
</html>
    `;
};

;

module.exports = {emailConfirmationTemplate,emailReinitialisation};