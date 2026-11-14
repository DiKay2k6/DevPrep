/**
 * Hàm tiện ích ghép nối chuỗi class Tailwind CSS gọn nhẹ, không cần cài thêm thư viện ngoài.
 * @param  {...any} classes Danh sách các class hoặc biểu thức điều kiện
 * @returns {string} Chuỗi class đã lọc bỏ giá trị falsy
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
