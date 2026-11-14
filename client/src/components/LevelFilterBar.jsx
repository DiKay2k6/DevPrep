import { Check, Layers, RotateCcw, Search } from 'lucide-react';
import { LEVELS } from '../data/tracks.mock.js';
import { cn } from '../utils/cn.js';

const CATEGORIES = [
  'All',
  'Frontend',
  'Backend',
  'Full-stack',
  'Mobile',
  'Database',
];

/**
 * Thanh pill filter ngang + nút lọc nhanh "Phù hợp kỹ năng của tôi" + ô tìm kiếm bo tròn.
 */
export default function LevelFilterBar({
  selectedLevel = 'All',
  onLevelChange,
  selectedCategory = 'All',
  onCategoryChange,
  onlyMySkills = false,
  onToggleOnlyMySkills,
  selectedSkills = [],
  searchQuery = '',
  onSearchChange,
  searchPlaceholder = 'Tìm kiếm theo tiêu đề hoặc tag kỹ thuật...',
  totalCount,
}) {
  const hasActiveFilter =
    selectedLevel !== 'All' ||
    selectedCategory !== 'All' ||
    onlyMySkills ||
    searchQuery.trim().length > 0;

  return (
    <search
      aria-label="Bộ lọc nội dung kỹ thuật"
      className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3.5"
    >
      {/* Hàng 1: Pill lọc Cấp độ + Ô tìm kiếm bo tròn bên phải */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-pressed={selectedLevel === 'All'}
            onClick={() => onLevelChange?.('All')}
            className={cn(
              'px-4 py-2 rounded-full text-xs font-semibold border transition-all whitespace-nowrap',
              selectedLevel === 'All'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50 shadow-xs'
                : 'border-slate-200 text-slate-600 bg-white hover:border-slate-300 hover:text-slate-900'
            )}
          >
            Tất cả trình độ
          </button>

          {LEVELS.map((lvl) => {
            const active = selectedLevel === lvl.id;
            return (
              <button
                key={lvl.id}
                type="button"
                aria-pressed={active}
                onClick={() => onLevelChange?.(lvl.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-all whitespace-nowrap',
                  active
                    ? 'border-blue-600 text-blue-600 bg-blue-50/50 shadow-xs'
                    : 'border-slate-200 text-slate-600 bg-white hover:border-slate-300 hover:text-slate-900'
                )}
              >
                <span
                  className={cn('w-2 h-2 rounded-full', lvl.dotClass)}
                  aria-hidden="true"
                />
                <span>Cấp độ {lvl.label}</span>
              </button>
            );
          })}
        </div>

        {/* Ô tìm kiếm bo tròn kiểu Prep Dashboard */}
        {typeof onSearchChange === 'function' && (
          <div className="relative w-full lg:w-80 shrink-0">
            <label htmlFor="filter-search-input" className="visually-hidden">
              Tìm kiếm nội dung
            </label>
            <Search
              className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="filter-search-input"
              name="q"
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck="false"
              className="w-full pl-9 pr-4 py-2 rounded-full border border-slate-200 bg-[#F8FAFC] text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 transition-colors"
            />
          </div>
        )}
      </div>

      {/* Hàng 2: Bộ lọc Chuyên ngành + Nút lọc nhanh "Phù hợp kỹ năng của tôi" & Tổng số mục */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-1.5">
          {typeof onCategoryChange === 'function' && (
            <>
              <span className="text-xs font-semibold text-slate-500 mr-1">
                Chuyên ngành:
              </span>
              {CATEGORIES.map((cat) => {
                const active = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onCategoryChange(cat)}
                    className={cn(
                      'px-3 py-1 rounded-full text-xs font-semibold transition-colors whitespace-nowrap',
                      active
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-[#F4F7FA] text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                    )}
                  >
                    {cat === 'All' ? 'Tất cả mảng' : cat}
                  </button>
                );
              })}
            </>
          )}

          {/* Nút lọc nhanh "Phù hợp kỹ năng của tôi" */}
          {typeof onToggleOnlyMySkills === 'function' && (
            <button
              type="button"
              aria-pressed={onlyMySkills}
              onClick={onToggleOnlyMySkills}
              className={cn(
                'inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold border transition-all whitespace-nowrap ml-1',
                onlyMySkills
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-blue-50/70 text-blue-700 border-blue-200 hover:bg-blue-100/80'
              )}
            >
              {onlyMySkills ? (
                <Check className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <Layers className="w-3.5 h-3.5" aria-hidden="true" />
              )}
              <span>Phù hợp kỹ năng của tôi ({selectedSkills.length})</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 ml-auto">
          {typeof totalCount === 'number' && (
            <span>
              Hiển thị <strong className="text-slate-900">{totalCount}</strong> mục
            </span>
          )}
          {hasActiveFilter && (
            <button
              type="button"
              onClick={() => {
                onLevelChange?.('All');
                onCategoryChange?.('All');
                if (onlyMySkills) onToggleOnlyMySkills?.();
                onSearchChange?.('');
              }}
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Đặt lại</span>
            </button>
          )}
        </div>
      </div>
    </search>
  );
}
