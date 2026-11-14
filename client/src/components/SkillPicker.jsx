import { useEffect, useRef } from 'react';
import { Check, Layers, RotateCcw, X } from 'lucide-react';
import { MOCK_USER_PROFILE, SKILL_GROUPS } from '../data/tracks.mock.js';
import { cn } from '../utils/cn.js';

/**
 * Bộ chọn nhóm Kỹ năng – Công nghệ tái sử dụng (`SkillPicker`).
 * Cho phép chọn/bỏ chọn nhiều kỹ năng theo 5 nhóm chuyên môn với giao diện pill chip rõ ràng,
 * hỗ trợ điều hướng và kích hoạt bằng bàn phím (Tab, Enter, Space).
 */
export default function SkillPicker({
  selectedSkills = [],
  onChange,
  compact = false,
}) {
  const toggleSkill = (skillId) => {
    if (typeof onChange !== 'function') return;
    const exists = selectedSkills.includes(skillId);
    if (exists) {
      onChange(selectedSkills.filter((id) => id !== skillId));
    } else {
      onChange([...selectedSkills, skillId]);
    }
  };

  const handleResetDefault = () => {
    if (typeof onChange === 'function') {
      onChange([...MOCK_USER_PROFILE.selectedSkills]);
    }
  };

  const handleClearAll = () => {
    if (typeof onChange === 'function') {
      onChange([]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Thanh trạng thái số lượng kỹ năng đã chọn & nút thao tác nhanh */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200/80">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700">
          <Layers className="w-4 h-4 text-blue-600 shrink-0" aria-hidden="true" />
          <span>
            Đã chọn{' '}
            <strong className="text-blue-600 font-extrabold">
              {selectedSkills.length}
            </strong>{' '}
            kỹ năng / công nghệ mục tiêu
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={handleResetDefault}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Mặc định gợi ý</span>
          </button>

          {selectedSkills.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 font-semibold transition-colors"
            >
              <span>Bỏ chọn tất cả</span>
            </button>
          )}
        </div>
      </div>

      {/* Lưới 5 nhóm Kỹ năng – Công nghệ */}
      <div
        className={cn(
          'grid gap-3.5',
          compact ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2'
        )}
      >
        {SKILL_GROUPS.map((group) => {
          const selectedInGroup = group.skills.filter((s) =>
            selectedSkills.includes(s.id)
          ).length;

          return (
            <fieldset
              key={group.id}
              className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <legend className="text-xs sm:text-sm font-bold text-slate-900">
                  {group.title}
                </legend>
                {selectedInGroup > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold">
                    {selectedInGroup}/{group.skills.length}
                  </span>
                )}
              </div>

              {!compact && (
                <p className="text-xs text-slate-500 leading-relaxed">
                  {group.description}
                </p>
              )}

              <div className="flex flex-wrap gap-2 pt-0.5">
                {group.skills.map((skill) => {
                  const isSelected = selectedSkills.includes(skill.id);
                  return (
                    <button
                      key={skill.id}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => toggleSkill(skill.id)}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer select-none',
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                      )}
                    >
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      )}
                      <span>{skill.label}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Hộp thoại `<dialog>` chuẩn HTML5 để tùy chỉnh bộ kỹ năng ngay trên trang `/tracks`.
 */
export function SkillPickerModal({
  isOpen,
  onClose,
  selectedSkills,
  onChange,
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="skill-picker-modal-title"
      onClose={onClose}
      className="w-[min(94vw,780px)] max-h-[88dvh] m-auto rounded-3xl bg-white text-slate-900 border border-slate-200 shadow-2xl p-0 overflow-hidden"
    >
      <div className="flex flex-col max-h-[88dvh]">
        <header className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between gap-4 bg-white">
          <div>
            <h2
              id="skill-picker-modal-title"
              className="text-base sm:text-lg font-extrabold text-slate-900"
            >
              Tùy chỉnh Bộ kỹ năng &amp; Công nghệ mục tiêu
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Chọn các ngôn ngữ, framework và công cụ bạn muốn ưu tiên ôn tập (không phụ thuộc cứng vào cấp độ).
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng hộp thoại chọn kỹ năng"
            className="w-9 h-9 rounded-full inline-flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </header>

        <div className="p-6 scrollable-region flex-1">
          <SkillPicker selectedSkills={selectedSkills} onChange={onChange} />
        </div>

        <footer className="px-6 py-4 bg-[#F8FAFC] border-t border-slate-200/80 flex items-center justify-between gap-4">
          <span className="text-xs text-slate-500">
            Hệ thống tự động cập nhật danh sách bài học và câu hỏi đề xuất ngay khi bạn chọn.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors shrink-0"
          >
            Hoàn tất ({selectedSkills.length} kỹ năng)
          </button>
        </footer>
      </div>
    </dialog>
  );
}
