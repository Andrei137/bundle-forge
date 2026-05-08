import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { authService } from '@/services/authService';
import './TagPickerModal.css';

const SKELETON_WIDTHS = [64, 88, 56, 96, 72, 80, 64, 104, 56, 76, 92, 68, 84, 60, 96];

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const TagPickerModal = ({ isOpen, onClose, selectedTags, onTagsChange }) => {
  const [allTags, setAllTags] = useState([]);
  const [randomPool, setRandomPool] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [draggedIdx, setDraggedIdx] = useState(null);
  const [dragoverIdx, setDragoverIdx] = useState(null);
  const searchRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    setSearchQuery('');
    setCreateError('');
    setLoading(true);
    authService.getTags()
      .then(tags => {
        setAllTags(tags);
        setRandomPool(shuffle(tags));
      })
      .catch(() => { setAllTags([]); setRandomPool([]); })
      .finally(() => setLoading(false));
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const trimmedQuery = searchQuery.trim();

  const hasExactMatch = allTags.some(
    t => t.name.toLowerCase() === trimmedQuery.toLowerCase()
  );

  const canCreate = trimmedQuery.length > 0 && !hasExactMatch;

  const isSelected = useCallback(
    (tag) => selectedTags.some(s => s.id === tag.id),
    [selectedTags]
  );

  const toggleSuggested = (tag) => {
    if (isSelected(tag)) {
      onTagsChange(selectedTags.filter(s => s.id !== tag.id));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const removeChosen = (tagId) => {
    onTagsChange(selectedTags.filter(s => s.id !== tagId));
  };

  const handleCreate = async () => {
    if (!canCreate || creating) return;
    setCreating(true);
    setCreateError('');
    try {
      const newTag = await authService.createTag(trimmedQuery);
      setAllTags(prev => [...prev, newTag]);
      setRandomPool(prev => [...prev, newTag]);
      onTagsChange([...selectedTags, newTag]);
      setSearchQuery('');
      searchRef.current?.focus();
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  };

  // Drag reorder for chosen tags
  const handleDragStart = (idx) => setDraggedIdx(idx);

  const handleDragEnter = (idx) => setDragoverIdx(idx);

  const handleDrop = (dropIdx) => {
    if (draggedIdx === null || draggedIdx === dropIdx) {
      setDraggedIdx(null);
      setDragoverIdx(null);
      return;
    }
    const reordered = [...selectedTags];
    const [moved] = reordered.splice(draggedIdx, 1);
    reordered.splice(dropIdx, 0, moved);
    onTagsChange(reordered);
    setDraggedIdx(null);
    setDragoverIdx(null);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
    setDragoverIdx(null);
  };

  if (!isOpen) return null;

  const suggestedTags = trimmedQuery.length > 0
    ? allTags.filter(t => t.name.toLowerCase().includes(trimmedQuery.toLowerCase()))
    : allTags;

  return createPortal(
    <div
      className="tag-picker-backdrop"
      onPointerDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="presentation"
    >
      <div
        className="tag-picker-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tag-picker-title"
      >
        <div className="tag-picker-header">
          <h2 className="tag-picker-title" id="tag-picker-title">Tags</h2>
          <button
            className="tag-picker-close"
            onClick={onClose}
            aria-label="Close tag picker"
            type="button"
          >
            ✕
          </button>
        </div>

        <div className="tag-picker-body">
          {/* Zone 1: Chosen tags */}
          <div>
            <p className="tag-picker-section-label">Your chosen tags:</p>
            {selectedTags.length === 0 ? (
              <p className="tag-chosen-empty">
                No tags added yet. Choose from suggestions or search below.
              </p>
            ) : (
              <div className="tag-chosen-list" role="list" aria-label="Chosen tags">
                {selectedTags.map((tag, idx) => (
                  <div
                    key={tag.id}
                    role="listitem"
                    className={[
                      'tag-chosen-pill',
                      draggedIdx === idx ? 'is-dragging' : '',
                      dragoverIdx === idx && draggedIdx !== idx ? 'is-dragover' : ''
                    ].filter(Boolean).join(' ')}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragEnter={(e) => { e.preventDefault(); handleDragEnter(idx); }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(idx)}
                    onDragEnd={handleDragEnd}
                    title="Drag to reorder"
                  >
                    <span className="tag-chosen-drag-handle" aria-hidden="true">⋮⋮</span>
                    <span className="tag-chosen-name">{tag.name}</span>
                    <button
                      type="button"
                      className="tag-chosen-remove"
                      onClick={() => removeChosen(tag.id)}
                      aria-label={`Remove tag ${tag.name}`}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Zone 2: Suggested tags */}
          <div>
            <p className="tag-picker-section-label">Suggested tags:</p>
            <div
              className={[
                'tag-suggested-list',
                loading ? 'is-loading' : '',
                trimmedQuery.length > 0 ? 'is-filtering' : ''
              ].filter(Boolean).join(' ')}
              role="list"
              aria-label="Suggested tags"
              aria-busy={loading}
            >
              {loading
                ? SKELETON_WIDTHS.map((w, i) => (
                    <span
                      key={i}
                      className="tag-suggested-skeleton"
                      style={{ width: w }}
                      aria-hidden="true"
                    />
                  ))
                : suggestedTags.length === 0 && trimmedQuery.length > 0
                  ? <span className="tag-suggested-empty">No existing tags match.</span>
                  : suggestedTags.map((tag) => {
                      const selected = isSelected(tag);
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          role="listitem"
                          className={`tag-suggested-pill${selected ? ' is-selected' : ''}`}
                          onClick={() => toggleSuggested(tag)}
                          aria-pressed={selected}
                          aria-label={`${selected ? 'Remove' : 'Add'} tag ${tag.name}`}
                        >
                          {tag.name}
                        </button>
                      );
                    })
              }
            </div>
          </div>

          {/* Zone 3: Search */}
          <div className="tag-search-wrap">
            <input
              ref={searchRef}
              type="text"
              className="tag-search-input"
              placeholder="Search for tags..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCreateError('');
              }}
              aria-label="Search tags"
              aria-autocomplete="list"
              autoComplete="off"
            />

            {trimmedQuery.length === 0 && !loading && randomPool.length > 0 && (() => {
              const random = randomPool.filter(t => !selectedTags.find(s => s.id === t.id));
              return random.length > 0 ? (
                <div className="tag-search-random">
                  {random.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      className="tag-suggested-pill"
                      onClick={() => toggleSuggested(tag)}
                      aria-label={`Add tag ${tag.name}`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              ) : null;
            })()}

            {canCreate && (
              <div className="tag-search-results" role="listbox" aria-label="Create tag">
                <button
                  type="button"
                  className="tag-search-result-item is-create"
                  role="option"
                  onClick={handleCreate}
                  disabled={creating}
                  aria-selected="false"
                >
                  {creating ? `Adding "${trimmedQuery}"...` : `+ Add "${trimmedQuery}"`}
                </button>
              </div>
            )}

            {createError && (
              <p className="tag-search-error" role="alert">{createError}</p>
            )}
          </div>
        </div>

        <div className="tag-picker-footer">
          <button
            type="button"
            className="tag-picker-done"
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
