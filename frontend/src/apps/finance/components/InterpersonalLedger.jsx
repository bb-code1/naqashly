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
      <div className={`debt-sidebar ${!selectedPersonId ? 'show-mobile' : 'hide-mobile'}`}>
        <div className="finance-data-card directory-card">
          <div className="directory-header">
            <h4 className="directory-title">
              👥 Accounts Directory
            </h4>
            <Button
              type="button"
              variant={selectedPersonId === 'NEW_DEBT' || !selectedPersonId ? 'emerald' : 'outline'}
              onClick={() => setSelectedPersonId('NEW_DEBT')}
              className="directory-new-record-btn"
            >
              ➕ New Record
            </Button>
          </div>

          {/* Search Box */}
          <div className="directory-search-wrap">
            <input
              type="text"
              placeholder="🔍 Search contact by name..."
              value={contactSearch}
              onChange={e => {
                setContactSearch(e.target.value);
                setContactPage(1);
              }}
              className="directory-search-input"
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
                    <div className="directory-empty-msg">
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
                          <div className="contact-card-meta">
                            <strong className="contact-card-name">
                              {cs.person.name}
                            </strong>
                            <span className="contact-card-entries-count">
                              {cs.debts.length} entries
                            </span>
                          </div>
                          <span className={`contact-card-balance ${isActive ? 'active' : (cs.netReceivable >= 0 ? 'credit' : 'debit')}`}>
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
      <div className={`debt-main-panel ${selectedPersonId ? 'show-mobile' : 'hide-mobile'}`}>
        <div className="finance-data-card debt-main-panel-card">
          {!selectedPersonId ? (
            /* LEDGER SUMMARIZED LANDING COCKPIT (EMPTY STATE FOR DESKTOP) */
            (() => {
              const totalLentOverall = contactStatements.reduce((sum, statement) => {
                return sum + (statement.netReceivable > 0 ? statement.netReceivable : 0);
              }, 0);
              const totalBorrowedOverall = contactStatements.reduce((sum, statement) => {
                return sum + (statement.netReceivable < 0 ? Math.abs(statement.netReceivable) : 0);
              }, 0);
              const topDebtors = [...contactStatements]
                .filter(s => s.netReceivable > 0)
                .sort((a, b) => b.netReceivable - a.netReceivable)
                .slice(0, 3);
              const topCreditors = [...contactStatements]
                .filter(s => s.netReceivable < 0)
                .sort((a, b) => Math.abs(b.netReceivable) - Math.abs(a.netReceivable))
                .slice(0, 3);

              return (
                <div className="ledger-empty-dashboard">
                  <h3 className="ledger-dashboard-title">🤝 Peer Ledger Summary Dashboard</h3>
                  <p className="ledger-dashboard-subtitle">
                    Overview of outstanding receivables and payables across all personal & business contacts.
                  </p>

                  <div className="ledger-empty-summary-grid">
                    <div className="ledger-dashboard-stat-card lent">
                      <div className="stat-card-label">Total Owed to You (Lent)</div>
                      <div className="stat-card-value font-mono">₹{totalLentOverall.toFixed(2)}</div>
                    </div>
                    <div className="ledger-dashboard-stat-card borrow">
                      <div className="stat-card-label">Total You Owe (Borrowed)</div>
                      <div className="stat-card-value font-mono">₹{totalBorrowedOverall.toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="ledger-dashboard-details-row">
                    <div className="ledger-top-contacts-list">
                      <h4>🟢 Top Debtors (Owe You)</h4>
                      {topDebtors.length === 0 ? (
                        <div className="empty-subtext">No active receivables.</div>
                      ) : (
                        <ul>
                          {topDebtors.map(td => (
                            <li key={td.person.id} onClick={() => setSelectedPersonId(td.person.id)} className="dashboard-contact-row">
                              <span>{td.person.name}</span>
                              <strong className="credit font-mono">+₹{td.netReceivable.toFixed(0)}</strong>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="ledger-top-contacts-list">
                      <h4>🔴 Top Creditors (You Owe)</h4>
                      {topCreditors.length === 0 ? (
                        <div className="empty-subtext">No active payables.</div>
                      ) : (
                        <ul>
                          {topCreditors.map(tc => (
                            <li key={tc.person.id} onClick={() => setSelectedPersonId(tc.person.id)} className="dashboard-contact-row">
                              <span>{tc.person.name}</span>
                              <strong className="debit font-mono">-₹{Math.abs(tc.netReceivable).toFixed(0)}</strong>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  <div className="ledger-dashboard-actions">
                    <Button
                      type="button"
                      variant="emerald"
                      onClick={() => {
                        setSelectedPersonId('NEW_DEBT');
                        setPersonName('');
                        setPersonPhone('');
                        setPersonAddress('');
                        setSelectedExistingPerson(null);
                      }}
                      className="dashboard-new-record-btn"
                    >
                      ➕ Record New Peer Entry
                    </Button>
                  </div>
                </div>
              );
            })()
          ) : selectedPersonId === 'NEW_DEBT' ? (
            /* NEW INTERPERSONAL TRANSACTION FORM */
            <div className="debt-form-container">
              <div className="debt-detail-header-row">
                <button
                  type="button"
                  onClick={() => setSelectedPersonId(null)}
                  className="finance-mobile-back-btn"
                >
                  ⬅ Directory
                </button>
                <div>
                  <h3 className="debt-form-title">
                    ➕ Record New Entry
                  </h3>
                  <p className="debt-form-subtitle">
                    Type the name of any person (new or existing) to record an entry.
                  </p>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleDebtSubmit(e, personName.trim());
                }}
                className="modal-form debt-form-fields"
              >
                <div className="form-grid-2">
                  <div className="form-input-relative-wrap">
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
                      <div className="linked-profile-msg">
                        <span>✓ Linked to existing profile: {selectedExistingPerson.name}</span>
                        <button 
                          type="button" 
                          onClick={() => {
                            setSelectedExistingPerson(null);
                            setPersonName('');
                            setPersonPhone('');
                            setPersonAddress('');
                          }}
                          className="linked-profile-clear-btn"
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
                      className="form-input font-mono"
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

                <div className="form-submit-row">
                  <Button type="submit" variant="emerald" className="form-submit-btn">
                    + Log Entry
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            /* DETAILED BANK RUNNING BALANCE STATEMENT VIEW WITH QUICK-LOGGER AND APPLE CARD FEED */
            <div className="debt-statement-container">
              
              {/* Statement Header Summary */}
              <div className="debt-statement-header">
                <div>
                  <div className="debt-statement-title-line">
                    <button
                      type="button"
                      onClick={() => setSelectedPersonId(null)}
                      className="finance-mobile-back-btn"
                    >
                      ⬅ Directory
                    </button>
                    <h3 className="debt-statement-title">
                      🤝 Peer Activity: {activeContactStatement.person.name}
                    </h3>
                  </div>
                  <div className="debt-statement-subtitle">
                    Net Standing: <strong className={activeContactStatement.netReceivable >= 0 ? 'credit' : 'debit'}>
                      {activeContactStatement.netReceivable >= 0 ? 'Receivable' : 'Payable'} of ₹{Math.abs(activeContactStatement.netReceivable).toFixed(2)}
                    </strong>
                  </div>
                  {(activeContactStatement.person.phone || activeContactStatement.person.address) && (
                    <div className="debt-statement-contact-meta">
                      {activeContactStatement.person.phone && <span>📞 {activeContactStatement.person.phone}</span>}
                      {activeContactStatement.person.address && <span>📍 {activeContactStatement.person.address}</span>}
                    </div>
                  )}
                </div>

                <div className="debt-statement-header-actions">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => exportStatementToCSV && exportStatementToCSV(activeContactStatement)}
                    className="export-excel-btn"
                  >
                    📥 Export CSV Ledger
                  </Button>
                  <div className="debt-stat-box lent">
                    <div className="debt-stat-box-label">Lent Out</div>
                    <div className="debt-stat-box-value font-mono">
                      ₹{activeContactStatement.totalLent.toFixed(0)}
                    </div>
                  </div>
                  <div className="debt-stat-box borrow">
                    <div className="debt-stat-box-label">Borrowed</div>
                    <div className="debt-stat-box-value font-mono">
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
                className="quick-loan-logger-form"
              >
                <span className="quick-loan-label">
                  ⚡ Log Entry for {activeContactStatement.person.name}:
                </span>

                <input
                  type="number"
                  step="0.01"
                  placeholder="₹ Amount"
                  value={debtAmount}
                  onChange={e => setDebtAmount(e.target.value)}
                  className="quick-loan-input font-mono"
                  required
                />

                <select
                  value={debtType}
                  onChange={e => setDebtType(e.target.value)}
                  className="quick-loan-select"
                >
                  <option value="GIVE_LOAN">🟢 Lent Out (He owes me)</option>
                  <option value="TAKE_LOAN">📥 Borrowed (I owe him)</option>
                </select>

                <input
                  type="text"
                  placeholder="Note (e.g. Lunch UPI)"
                  value={debtNotes}
                  onChange={e => setDebtNotes(e.target.value)}
                  className="quick-loan-input note"
                />

                <Button type="submit" variant="emerald" className="quick-loan-submit-btn">
                  + Record
                </Button>
              </form>

              {/* Timeline Feed in Apple Card list style */}
              <div className="debt-activity-history-wrap">
                <h4 className="debt-activity-title">
                  📑 Transaction Activity History
                </h4>

                {activeContactStatement.debts.length === 0 ? (
                  <div className="debt-activity-empty">
                    No activity events recorded yet. Use the logger above to begin!
                  </div>
                ) : (
                  <div className="debt-timeline-container">
                    {activeContactStatement.debts.map(d => {
                      const isLent = d.debtType === 'GIVE_LOAN' || d.debtType === 'MAKE_PAYMENT' || d.debtType === 'CREDIT';
                      return (
                        <div key={d.id} className="debt-timeline-item">
                          <div className="debt-timeline-left">
                            {/* Left Directional Emoji Badge */}
                            <div className={`transaction-badge ${isLent ? 'sent' : 'received'}`}>
                              {isLent ? '📤' : '📥'}
                            </div>

                            {/* Middle Notes & Timestamp */}
                            <div className="debt-timeline-middle">
                              <span className="debt-timeline-notes">
                                {d.cleanNotes || d.notes || (isLent ? 'Lent cash out' : 'Borrowed cash')}
                              </span>
                              <span className="debt-timeline-date">
                                {d.givenDate || d.createdAt?.split('T')[0] || 'Today'}
                              </span>
                            </div>
                          </div>

                          {/* Right cash amount and delete/edit buttons */}
                          <div className="debt-timeline-actions">
                            <span className={`transaction-amount ${isLent ? 'sent' : 'received'}`}>
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
                              className="debt-action-icon-btn edit"
                              title="Edit Entry"
                            >
                              ✏️
                            </button>
                            <button
                              type="button"
                              onClick={() => requestSingleDelete(d.id)}
                              className="debt-action-icon-btn delete"
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

    </div>
  );
};
