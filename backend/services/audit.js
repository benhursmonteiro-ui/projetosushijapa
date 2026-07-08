import db from '../db/index.js';

export const addAuditEntry = async (module, action, user = null) => {
  const userName = user?.name || 'Sistema';
  const userRole = user?.role || 'Socio';
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const id = `al-${Date.now()}`;

  try {
    await db.query(
      'INSERT INTO audit_log (id, date, time, "user", role, module, action) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [id, dateStr, timeStr, userName, userRole, module, action]
    );
    return {
      id,
      date: dateStr,
      time: timeStr,
      user: userName,
      role: userRole,
      module,
      action
    };
  } catch (err) {
    console.error('Erro ao salvar log de auditoria:', err);
    return null;
  }
};
