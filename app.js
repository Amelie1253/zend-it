const { useState } = React;

// For now, let's use simple text instead of icons
const Copy = () => React.createElement('span', null, 'Copy');
const Send = () => React.createElement('span', null, 'Send'); 
const Plus = () => React.createElement('span', null, '+');
const Trash2 = () => React.createElement('span', null, 'Delete');
const UserPlus = () => React.createElement('span', null, 'Add Contact');

function WordleBulkSender() {
  const [wordleResult, setWordleResult] = useState('');
  const [customMessage, setCustomMessage] = useState('Check out my Wordle result!');
  const [platform, setPlatform] = useState('whatsapp');
  const [savedContacts, setSavedContacts] = useState([]);
  const [selectedContactIds, setSelectedContactIds] = useState([]);
  const [generatedLinks, setGeneratedLinks] = useState([]);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactInfo, setNewContactInfo] = useState('');

  const addNewContact = () => {
    if (newContactName.trim() && newContactInfo.trim()) {
      const newContact = {
        id: Date.now(),
        name: newContactName.trim(),
        info: newContactInfo.trim()
      };
      setSavedContacts([...savedContacts, newContact]);
      setNewContactName('');
      setNewContactInfo('');
      setShowAddContact(false);
    }
  };

  const deleteContact = (id) => {
    setSavedContacts(savedContacts.filter(contact => contact.id !== id));
    setSelectedContactIds(selectedContactIds.filter(selectedId => selectedId !== id));
  };

  const toggleContactSelection = (id) => {
    if (selectedContactIds.includes(id)) {
      setSelectedContactIds(selectedContactIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedContactIds([...selectedContactIds, id]);
    }
  };

  const clearGeneratedLinks = () => {
    setGeneratedLinks([]);
    setSelectedContactIds([]);
  };

  const generateLinks = () => {
    const message = `${customMessage}\n\n${wordleResult}`;
    const encodedMessage = encodeURIComponent(message);
    
    const selectedContacts = savedContacts.filter(contact => 
      selectedContactIds.includes(contact.id)
    );
    
    const links = selectedContacts.map(contact => {
      const recipient = contact.info;
      const isPhoneNumber = /^[\+]?[\d\s\-\(\)]+$/.test(recipient.trim());
      
      switch(platform) {
        case 'whatsapp':
          if (isPhoneNumber) {
            const cleanRecipient = recipient.replace(/\D/g, '');
            return {
              contact,
              url: `https://wa.me/${cleanRecipient}?text=${encodedMessage}`,
              platform: 'WhatsApp',
              type: 'Individual'
            };
          } else {
            return {
              contact,
              url: `https://web.whatsapp.com/`,
              platform: 'WhatsApp',
              type: 'Group',
              note: 'Select group manually and paste message'
            };
          }
        case 'sms':
          if (isPhoneNumber) {
            const cleanRecipient = recipient.replace(/\D/g, '');
            return {
              contact,
              url: `sms:${cleanRecipient}?body=${encodedMessage}`,
              platform: 'SMS',
              type: 'Individual'
            };
          } else {
            return null;
          }
        case 'telegram':
          return {
            contact,
            url: `https://t.me/${recipient.replace('@', '')}`,
            platform: 'Telegram',
            type: recipient.includes('@') ? 'Direct' : 'Group'
          };
        default:
          return null;
      }
    }).filter(Boolean);
    
    setGeneratedLinks(links);
  };

  const copyAllLinks = () => {
    const linkText = generatedLinks
      .map(link => `${link.contact.name}: ${link.url}`)
      .join('\n');
    navigator.clipboard.writeText(linkText);
  };

  const copyMessage = () => {
    const message = `${customMessage}\n\n${wordleResult}`;
    navigator.clipboard.writeText(message);
  };

  const openAllLinks = () => {
    generatedLinks.forEach((link, index) => {
      setTimeout(() => {
        window.open(link.url, '_blank');
      }, index * 1000);
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen">
      <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white p-6 rounded-lg mb-8">
        <h1 className="text-3xl font-bold mb-2">Wordle Bulk Sender</h1>
        <p className="text-green-100">Send your Wordle results to multiple people at once!</p>
      </div>

      <div className="space-y-8">
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Wordle Result</h2>
          <textarea
            value={wordleResult}
            onChange={(e) => setWordleResult(e.target.value)}
            placeholder="Paste your Wordle result here...&#10;&#10;Wordle 1,234 4/6&#10;&#10;🟨⬜🟩⬜⬜&#10;⬜🟩🟩🟩⬜&#10;⬜🟩🟩🟩🟩&#10;🟩🟩🟩🟩🟩"
            className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none font-mono text-sm"
          />
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Custom Message</h2>
          <textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Add a personal message..."
            className="w-full h-20 p-3 border border-gray-300 rounded-lg resize-none"
          />
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Platform</h2>
          <div className="flex flex-wrap gap-3">
            {[
              { value: 'whatsapp', label: 'WhatsApp' },
              { value: 'sms', label: 'SMS' },
              { value: 'telegram', label: 'Telegram' }
            ].map(option => (
              <label key={option.value} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="platform"
                  value={option.value}
                  checked={platform === option.value}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="mr-2"
                />
                <span className="text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Contacts & Recipients</h2>
            <button
              onClick={() => setShowAddContact(true)}
              className="flex items-center gap-2 bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              <UserPlus size={16} />
              Add Contact
            </button>
          </div>

          {showAddContact && (
            <div className="mb-6 p-4 bg-white rounded-lg border-2 border-green-200">
              <h3 className="font-medium mb-3">Add New Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Contact Name (e.g., Mom, Wordle Gang)"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="p-2 border border-gray-300 rounded"
                />
                <input
                  type="text"
                  placeholder={
                    platform === 'whatsapp' || platform === 'sms' 
                      ? "+1234567890 or Group Name" 
                      : "@username or @groupname"
                  }
                  value={newContactInfo}
                  onChange={(e) => setNewContactInfo(e.target.value)}
                  className="p-2 border border-gray-300 rounded"
                />
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={addNewContact}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Save Contact
                </button>
                <button
                  onClick={() => {
                    setShowAddContact(false);
                    setNewContactName('');
                    setNewContactInfo('');
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {savedContacts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No saved contacts yet. Add some contacts above!</p>
            ) : (
              <>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-gray-600">Select contacts to send to:</span>
                  <button
                    onClick={() => setSelectedContactIds(selectedContactIds.length === savedContacts.length 
                      ? [] 
                      : savedContacts.map(c => c.id))}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {selectedContactIds.length === savedContacts.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                {savedContacts.map((contact) => (
                  <div key={contact.id} className="flex items-center gap-3 p-3 bg-white rounded border">
                    <input
                      type="checkbox"
                      checked={selectedContactIds.includes(contact.id)}
                      onChange={() => toggleContactSelection(contact.id)}
                      className="w-4 h-4"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800">{contact.name}</div>
                      <div className="text-sm text-gray-600">{contact.info}</div>
                    </div>
                    <button
                      onClick={() => deleteContact(contact.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="flex gap-3 mb-4">
            <button
              onClick={generateLinks}
              disabled={!wordleResult.trim() || selectedContactIds.length === 0}
              className="flex-1 bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
            >
              Generate Links for {selectedContactIds.length} Selected
            </button>
            <button
              onClick={copyMessage}
              disabled={!wordleResult.trim()}
              className="flex items-center gap-2 bg-gray-500 text-white px-4 py-3 rounded-lg hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <Copy size={16} />
              Copy Message
            </button>
            {generatedLinks.length > 0 && (
              <button
                onClick={clearGeneratedLinks}
                className="flex items-center gap-2 bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-colors"
              >
                Clear Links
              </button>
            )}
          </div>

          {generatedLinks.length > 0 && (
            <>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Generated Links</h3>
                <div className="flex gap-2">
                  <button
                    onClick={copyAllLinks}
                    className="flex items-center gap-2 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Copy size={16} />
                    Copy All
                  </button>
                  <button
                    onClick={openAllLinks}
                    className="flex items-center gap-2 bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Send size={16} />
                    Open All
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {generatedLinks.map((link, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-white rounded border">
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-gray-700 block truncate">
                        {link.contact.name}
                      </span>
                      <span className="text-sm text-gray-500">{link.contact.info}</span>
                      {link.note && (
                        <span className="text-xs text-orange-600 block">{link.note}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {link.platform}
                      </span>
                      {link.type && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {link.type}
                        </span>
                      )}
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors"
                      >
                        {link.type === 'Group' ? 'Open' : 'Send'}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">Tips:</h3>
        <div className="text-blue-700 text-sm space-y-2">
          <div>
            <strong>Contact Management:</strong>
            <ul className="ml-4 mt-1 space-y-1">
              <li>• Save contacts once, reuse daily by just checking them off</li>
              <li>• Add individual contacts with friendly names</li>
              <li>• Groups and individuals can be mixed in your contact list</li>
              <li>• Use "Clear Links" if you want to start over or send something different</li>
            </ul>
          </div>
          <div>
            <strong>Platform Support:</strong>
            <ul className="ml-4 mt-1 space-y-1">
              <li>• WhatsApp: Phone numbers (+1234567890) and group names work</li>
              <li>• Telegram: @username and @groupname supported</li>
              <li>• SMS: Phone numbers only (no group support)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(WordleBulkSender));