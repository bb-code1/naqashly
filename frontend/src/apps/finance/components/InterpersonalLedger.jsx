import React from 'react';
import { Button } from '../../../components/ui/Button';

export const InterpersonalLedger = ({
  contactStatements,
  contactSearch,
  setContactSearch,
  contactPage,
  setContactPage,
  selectedPersonId,
  setSelectedPersonId,

  personName,
  setPersonName,
  personPhone,
  setPersonPhone,
  personAddress,
  setPersonAddress,
  selectedExistingPerson,
  setSelectedExistingPerson,

  debtAmount,
  setDebtAmount,
  debtType,
  setDebtType,
  debtNotes,
  setDebtNotes,
  handleDebtSubmit,
  handleNameBlur,

  requestSingleDelete,
  setEditingRecord,
  setEditAmount,
  setEditType,
  setEditNotes,
  exportStatementToCSV
}) => {
  const activeContactStatement = contactStatements.find(cs => cs.person.id === selectedPersonId) || null;

  return (
    <div className="debt-workspace-grid">
      
      {/* LEFT SIDEBAR: CONTACT LIST & CREATE TRIGGER */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className="finance-data-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: '900', color: 'var(--text-heading)', margin: 0 }}>
              👥 Accounts Directory
            </h4>
            <Button
              type="button"
              variant={selectedPersonId === 'NEW_DEBT' || !selectedPersonId ? 'emerald' : 'outline'}
              onClick={() => setSelectedPersonId('NEW_DEBT')}
              style={{ fontSize: '0.74rem', padding: '0.35rem 0.65rem' }}
            >
              ➕ New Record
            </Button>
          </div>

          {/* Search Box */}
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="🔍 Search contact by name..."
              value={contactSearch}
              onChange={e => {
                setContactSearch(e.target.value);
                setContactPage(1);
              }}
              style={{ width: '100%', boxSizing: 'border-box', padding: '0.45rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-heading)', fontSize: '0.8rem' }}
            />
          </div>

          {(() => {
            const filteredContacts = contactStatements.filter(cs =>
              cs.person.name?.toLowerCase().includes(contactSearch.toLowerCase())
            );
            const itemsPerPage = 5;
            const totalPages = Math.max(1, Math.ceil(filteredContacts.length / itemsPerPage));
            const pageContacts = filteredContacts.slice((contactPage - 1) * itemsPerPage, contactPage * itemsPerPage);

            return (
              <>
                <div className="debt-contact-list">
                  {pageContacts.length === 0 ? (
                    <div style={{ padding: '2rem 1rem', textShadow: 'none', color: 'var(--text-muted)', fontSize: '0.78rem', textAlign: 'center' }}>
                      No matches found
                    </div>
                  ) : (
                    pageContacts.map(cs => {
                      const isActive = selectedPersonId === cs.person.id;
                      return (
                        <div
                          key={cs.person.id}
                          onClick={() => setSelectedPersonId(cs.person.id)}
                          className={`debt-contact-card ${isActive ? 'active' : ''}`}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <strong style={{ fontSize: '0.88rem', color: isActive ? '#fff' : 'var(--text-heading)' }}>
                              {cs.person.name}
                            </strong>
                            <span style={{ fontSize: '0.7rem', color: isActive ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)', marginTop: '0.15rem' }}>
                              {cs.debts.length} entries
                            </span>
                          </div>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', fontWeight: '800', color: isActive ? '#fff' : (cs.netReceivable >= 0 ? 'var(--accent-emerald)' : 'var(--accent-danger)') }}>
                            {cs.netReceivable >= 0 ? '+' : '-'}₹{Math.abs(cs.netReceivable).toFixed(0)}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Pagination Bar */}
                {totalPages > 1 && (
                  <div className="directory-pagination">
                    <button
                      type="button"
                      className="pagination-btn"
                      disabled={contactPage === 1}
                      onClick={() => setContactPage(prev => Math.max(1, prev - 1))}
                    >
                      ◀ Prev
                    </button>
                    <span className="pagination-info">
                      {contactPage} of {totalPages}
                    </span>
                    <button
                      type="button"
                      className="pagination-btn"
                      disabled={contactPage === totalPages}
                      onClick={() => setContactPage(prev => Math.min(totalPages, prev + 1))}
                    >
                      Next ▶
                    </button>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </div>

      {/* RIGHT PANEL: STATEMENT or CREATE FORM */}
      <div className="finance-data-card" style={{ padding: '1.5rem' }}>
        {(!selectedPersonId || selectedPersonId === 'NEW_DEBT') ? (
          /* NEW INTERPERSONAL TRANSACTION FORM */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: 'var(--text-heading)', margin: 0 }}>
                ➕ Record New Entry
              </h3>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Type the name of any person (new or existing) to record an entry.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleDebtSubmit(e, personName.trim());
              }}
              className="modal-form"
              style={{ gap: '1rem' }}
            >
              <div className="form-grid-2">
                <div style={{ position: 'relative' }}>
                  <label className="form-label">Contact Person Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Tariq Ahmad"
                    value={personName}
                    onChange={e => {
                      setPersonName(e.target.value);
                      setSelectedExistingPerson(null);
                    }}
                    onBlur={handleNameBlur}
                    className="form-input"
                    required
                  />

                  {selectedExistingPerson && (
                    <div style={{ marginTop: '0.45rem', fontSize: '0.72rem', color: 'var(--accent-emerald)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>✓ Linked to existing profile: {selectedExistingPerson.name}</span>
                      <button 
                        type="button" 
                        onClick={() => {
                          setSelectedExistingPerson(null);
                          setPersonName('');
                          setPersonPhone('');
                          setPersonAddress('');
                        }}
                        style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer', fontSize: '0.72rem' }}
                      >
                        Clear Selection
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="form-label">Transaction Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={debtAmount}
                    onChange={e => setDebtAmount(e.target.value)}
                    className="form-input"
                    style={{ fontFamily: 'var(--font-mono)' }}
                    required
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div>
                  <label className="form-label">Direction</label>
                  <select value={debtType} onChange={e => setDebtType(e.target.value)} className="form-select">
                    <option value="GIVE_LOAN">🟢 Lent Out (Owed to You)</option>
                    <option value="TAKE_LOAN">📥 Borrowed (You Owe)</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">📝 Notes & Details</label>
                  <input
                    type="text"
                    placeholder="e.g. UPI transfer for lunch"
                    value={debtNotes}
                    onChange={e => setDebtNotes(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div>
                  <label className="form-label">
                    📞 Phone Number {selectedExistingPerson ? '(Linked)' : '* (Required)'}
                  </label>
                  <input
                    type="tel"
                    placeholder={selectedExistingPerson ? '' : "e.g. +91 99999 99999"}
                    value={personPhone}
                    onChange={e => setPersonPhone(e.target.value)}
                    className="form-input"
                    disabled={!!selectedExistingPerson}
                    required={!selectedExistingPerson}
                  />
                </div>

                <div>
                  <label className="form-label">
                    📍 Address/Location {selectedExistingPerson ? '(Linked)' : '* (Required)'}
                  </label>
                  <input
                    type="text"
                    placeholder={selectedExistingPerson ? '' : "e.g. Delhi, Sector 5"}
                    value={personAddress}
                    onChange={e => setPersonAddress(e.target.value)}
                    className="form-input"
                    disabled={!!selectedExistingPerson}
                    required={!selectedExistingPerson}
                  />
                </div>
              </div>

              <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                <Button type="submit" variant="emerald" style={{ fontWeight: '800' }}>
                  + Log Entry
                </Button>
              </div>
            </form>
          </div>
        ) : (
          /* DETAILED BANK RUNNING BALANCE STATEMENT VIEW WITH QUICK-LOGGER AND APPLE CARD FEED */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Statement Header Summary */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: 'var(--text-heading)', margin: 0 }}>
                  🤝 Peer Activity Summary: {activeContactStatement.person.name}
                </h3>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  Net Standing: <strong style={{ color: activeContactStatement.netReceivable >= 0 ? 'var(--accent-emerald)' : 'var(--accent-danger)' }}>
                    {activeContactStatement.netReceivable >= 0 ? 'Receivable' : 'Payable'} of ₹{Math.abs(activeContactStatement.netReceivable).toFixed(2)}
                  </strong>
                </div>
                {(activeContactStatement.person.phone || activeContactStatement.person.address) && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'flex', gap: '0.75rem' }}>
                    {activeContactStatement.person.phone && <span>📞 {activeContactStatement.person.phone}</span>}
                    {activeContactStatement.person.address && <span>📍 {activeContactStatement.person.address}</span>}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => exportStatementToCSV && exportStatementToCSV(activeContactStatement)}
                  style={{ fontSize: '0.74rem', padding: '0.35rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.3' }}
                >
                  📊 Export to Excel
                </Button>
                <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', padding: '0.35rem 0.65rem', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Lent Out</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
                    ₹{activeContactStatement.totalLent.toFixed(0)}
                  </div>
                </div>
                <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', padding: '0.35rem 0.65rem', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Borrowed</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--accent-danger)', fontFamily: 'var(--font-mono)' }}>
                    ₹{activeContactStatement.totalBorrowed.toFixed(0)}
                  </div>
                </div>
              </div>
            </div>

            {/* Inline Quick Loan Logger Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleDebtSubmit(e, activeContactStatement.person.name);
              }}
              style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '0.85rem', display: 'flex', flexWrap: 'wrap', gap: '0.55rem', alignItems: 'center' }}
            >
              <span style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--text-muted)', marginRight: '0.25rem' }}>
                ⚡ Log Entry for {activeContactStatement.person.name}:
              </span>

              <input
                type="number"
                step="0.01"
                placeholder="₹ Amount"
                value={debtAmount}
                onChange={e => setDebtAmount(e.target.value)}
                style={{ width: '90px', padding: '0.4rem 0.6rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-heading)', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}
                required
              />

              <select
                value={debtType}
                onChange={e => setDebtType(e.target.value)}
                style={{ padding: '0.4rem 0.6rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-heading)', fontSize: '0.78rem' }}
              >
                <option value="GIVE_LOAN">🟢 Lent Out (He owes me)</option>
                <option value="TAKE_LOAN">📥 Borrowed (I owe him)</option>
              </select>

              <input
                type="text"
                placeholder="Note (e.g. Lunch UPI)"
                value={debtNotes}
                onChange={e => setDebtNotes(e.target.value)}
                style={{ flex: 1, minWidth: '120px', padding: '0.4rem 0.6rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', color: 'var(--text-heading)', fontSize: '0.78rem' }}
              />

              <Button type="submit" variant="emerald" style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem' }}>
                + Record
              </Button>
            </form>

            {/* Timeline Feed in Apple Card list style */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-muted)', margin: '0.25rem 0' }}>
                📑 Transaction Activity History
              </h4>

              {activeContactStatement.debts.length === 0 ? (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                  No activity events recorded yet. Use the logger above to begin!
                </div>
              ) : (
                <div className="debt-timeline-container" style={{ gap: '0.65rem' }}>
                  {activeContactStatement.debts.map(d => {
                    const isLent = d.debtType === 'GIVE_LOAN' || d.debtType === 'MAKE_PAYMENT' || d.debtType === 'CREDIT';
                    return (
                      <div key={d.id} className="debt-timeline-item">
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {/* Left Directional Emoji Badge */}
                          <div className={`transaction-badge ${isLent ? 'sent' : 'received'}`}>
                            {isLent ? '📤' : '📥'}
                          </div>

                          {/* Middle Notes & Timestamp */}
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-heading)' }}>
                              {d.cleanNotes || d.notes || (isLent ? 'Lent cash out' : 'Borrowed cash')}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                              {d.givenDate || d.createdAt?.split('T')[0] || 'Today'}
                            </span>
                          </div>
                        </div>

                        {/* Right cash amount and delete/edit buttons */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                          <span className={`transaction-amount ${isLent ? 'sent' : 'received'}`} style={{ marginRight: '0.45rem' }}>
                            {isLent ? '+' : '-'}₹{Number(d.amount).toFixed(0)}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingRecord(d);
                              setEditAmount(d.amount);
                              setEditType(d.debtType);
                              setEditNotes(d.cleanNotes || d.notes || '');
                            }}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer', padding: '0.2rem', opacity: 0.6 }}
                            title="Edit Entry"
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            onClick={() => requestSingleDelete(d.id)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer', padding: '0.2rem', opacity: 0.6 }}
                            title="Delete Entry"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}
      </div>

    </div>
  );
};
