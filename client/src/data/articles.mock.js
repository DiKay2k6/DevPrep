export const ARTICLES_MOCK = [
  {
    _id: 'art_js_event_loop_01',
    title: 'Cơ chế Event Loop, Microtask và Macrotask trong JavaScript',
    slug: 'co-che-event-loop-microtask-va-macrotask-trong-javascript',
    summary:
      'Giải thích chi tiết cách Call Stack, Web APIs, Microtask Queue (Promise) và Callback Queue (setTimeout) phối hợp thực thi bất đồng bộ trên một luồng đơn.',
    level: 'Fresher',
    category: 'Frontend',
    tags: ['JavaScript', 'ReactJS', 'Event Loop'],
    readingTimeMinutes: 8,
    updatedAt: '2026-11-02',
    author: 'Ban Chuyên môn DevPrep',
    questionIds: ['q_mcq_event_loop_01', 'q_fill_event_loop_02'],
    content: `## 1. Tại sao JavaScript đơn luồng nhưng không bị treo giao diện?

JavaScript Runtime trên trình duyệt sử dụng **Single Call Stack** (một ngăn xếp lệnh duy nhất). Tuy nhiên, các tác vụ tốn thời gian như gọi mạng (\`fetch\`), hẹn giờ (\`setTimeout\`) hay đọc sự kiện DOM được ủy quyền cho **Web APIs** của trình duyệt xử lý ở tầng nền.

Khi tác vụ hoàn tất, callback của chúng không nhảy thẳng vào Call Stack mà được xếp vào hàng đợi để **Event Loop** điều phối.

## 2. Phân biệt Microtask Queue và Macrotask Queue

Không phải mọi callback bất đồng bộ đều có độ ưu tiên ngang nhau. Runtime chia hàng đợi thành 2 nhóm chính:

- **Microtask Queue (Độ ưu tiên cao):** Chứa callback của \`Promise.then/catch/finally\`, \`queueMicrotask()\`, và \`MutationObserver\`.
- **Macrotask Queue / Task Queue (Độ ưu tiên thấp hơn):** Chứa callback của \`setTimeout\`, \`setInterval\`, \`setImmediate\` (Node.js) và các sự kiện I/O.

### Quy tắc vàng của Event Loop

Ngay sau khi **Call Stack hoàn toàn trống**, Event Loop sẽ:
1. Duyệt và thực thi **toàn bộ** các tác vụ đang có trong **Microtask Queue** (kể cả microtask mới sinh ra trong lúc đang chạy) cho đến khi hàng đợi này rỗng.
2. Lấy **đúng 1 tác vụ** đầu tiên từ **Macrotask Queue** đưa vào Call Stack để thực thi.
3. Lặp lại việc kiểm tra và dọn sạch Microtask Queue trước khi sang Macrotask tiếp theo.

## 3. Ví dụ phân tích thứ tự Output thường gặp khi phỏng vấn

\`\`\`javascript
console.log('1. Sync Start');

setTimeout(() => {
  console.log('2. setTimeout (Macrotask)');
}, 0);

Promise.resolve()
  .then(() => {
    console.log('3. Promise 1 (Microtask)');
  })
  .then(() => {
    console.log('4. Promise 2 (Microtask nối tiếp)');
  });

console.log('5. Sync End');
\`\`\`

**Thứ tự in ra màn hình Console:**
1. \`1. Sync Start\` (Chạy đồng bộ trên Call Stack)
2. \`5. Sync End\` (Chạy đồng bộ trên Call Stack)
3. \`3. Promise 1 (Microtask)\` (Call Stack rỗng -> vét cạn Microtask Queue)
4. \`4. Promise 2 (Microtask nối tiếp)\` (Vẫn trong pha dọn sạch Microtask Queue)
5. \`2. setTimeout (Macrotask)\` (Chỉ chạy sau khi Microtask Queue đã trống hoàn toàn)

## 4. Lỗi thực tế cần tránh

- Không lạm dụng đệ quy \`Promise.resolve().then(...)\` vô hạn vì sẽ làm **đói (starve)** Macrotask Queue và chặn trình duyệt vẽ lại giao diện (repaint).
- Luôn nhớ \`async/await\` bản chất là cú pháp bọc trên Promise: phần code phía sau từ khóa \`await\` sẽ được đưa vào **Microtask Queue**.`,
  },
  {
    _id: 'art_mongo_compound_index_02',
    title: 'Tối ưu Truy vấn MongoDB với Compound Index và Quy tắc ESR',
    slug: 'toi-uu-truy-van-mongodb-voi-compound-index-va-quy-tac-esr',
    summary:
      'Hướng dẫn thiết kế Compound Index theo thứ tự Equality - Sort - Range (ESR) và cách đọc kết quả explain("executionStats") để loại bỏ COLLSCAN.',
    level: 'Junior',
    category: 'Database',
    tags: ['MongoDB', 'SQL', 'System Design'],
    readingTimeMinutes: 10,
    updatedAt: '2026-11-05',
    author: 'Ban Chuyên môn DevPrep',
    questionIds: ['q_mcq_mongo_esr_03', 'q_fill_mongo_select_04'],
    content: `## 1. Khi nào truy vấn MongoDB bị chậm?

Khi một truy vấn lọc theo nhiều điều kiện mà không có Index phù hợp, MongoDB buộc phải thực hiện **COLLSCAN (Collection Scan)** — đọc tuần tự từng document trên đĩa để kiểm tra điều kiện. Với bảng hàng trăm nghìn câu hỏi hoặc lịch sử nộp bài, độ trễ sẽ tăng vọt.

## 2. Quy tắc ESR (Equality – Sort – Range) khi đặt thứ tự trường trong Compound Index

Trong MongoDB, **thứ tự các trường trong Compound Index quyết định trực tiếp hiệu quả truy vấn**:

1. **E – Equality (So sánh bằng chính xác):** Đặt các trường lọc bằng dấu \`=\` hoặc \`$eq\` lên đầu tiên (ví dụ: \`status: "approved"\`, \`level: "Junior"\`). Nó giúp thuẹp nhanh nhánh cây B-Tree.
2. **S – Sort (Sắp xếp):** Đặt trường dùng trong \`.sort()\` ngay sau nhóm Equality để MongoDB trả kết quả theo đúng thứ tự trên Index mà **không cần bước SORT trong bộ nhớ (in-memory sort 32MB limit)**.
3. **R – Range (Khoảng giá trị / Tập hợp):** Đặt các phép lọc \`$in\`, \`$gte\`, \`$lte\` ở cuối cùng.

\`\`\`javascript
// Ví dụ khai báo Compound Index chuẩn trên Schema Question của DevPrep
questionSchema.index({
  status: 1,     // Equality
  level: 1,      // Equality
  category: 1,   // Equality
  createdAt: -1, // Sort
  tags: 1        // Multikey / Range
});
\`\`\`

## 3. Chống lộ đáp án bằng Projection kết hợp Index

Khi lấy danh sách câu hỏi cho ứng viên làm bài, tuyệt đối không trả về trường đáp án đúng trong \`payload\`:

\`\`\`javascript
const questions = await Question.find({
  status: 'approved',
  level: 'Junior',
  category: 'Backend',
})
  .select('-payload.correctOptionIds -payload.acceptedAnswers')
  .sort({ createdAt: -1 })
  .lean();
\`\`\`

## 4. Kiểm chứng bằng explain("executionStats")

Khi kiểm tra kế hoạch thực thi, hãy chú ý 3 chỉ số quan trọng:
- \`winningPlan.stage\`: Phải có \`IXSCAN\`, tránh \`COLLSCAN\` hoặc \`SORT\` (in-memory).
- \`totalDocsExamined\` nên xấp xỉ bằng \`nReturned\`.`,
  },
  {
    _id: 'art_auth_jwt_refresh_03',
    title: 'Kiến trúc Xác thực JWT: Access Token, Refresh Token và Axios Interceptor',
    slug: 'kien-truc-xac-thuc-jwt-access-token-refresh-token-va-axios-interceptor',
    summary:
      'Phân tích luồng cấp phát cặp Token, lý do lưu Refresh Token trong HttpOnly Cookie và kỹ thuật Silent Refresh tự động bằng Axios Response Interceptor.',
    level: 'Junior',
    category: 'Full-stack',
    tags: ['JWT Auth', 'ReactJS', 'ExpressJS', 'Web Security'],
    readingTimeMinutes: 9,
    updatedAt: '2026-11-08',
    author: 'Ban Chuyên môn DevPrep',
    questionIds: ['q_mcq_jwt_security_05', 'q_coding_rate_window_06'],
    content: `## 1. Bài toán đánh đổi giữa Thời hạn Token và Bảo mật

Nếu cấp một **Access Token** có hạn sống dài (ví dụ 30 ngày) và lưu ở \`localStorage\`, khi ứng dụng dính lỗ hổng XSS, kẻ tấn công có thể đánh cắp token và chiếm quyền tài khoản trong suốt 30 ngày mà Server khó thu hồi ngay (nếu không tra cứu blacklist mỗi request).

Giải pháp chuẩn trong kiến trúc MERN thực tế là tách làm 2 loại token:

- **Access Token (Ngắn hạn: 15 phút):** Đính kèm vào header \`Authorization: Bearer <token>\` để xác thực nhanh không trạng thái (stateless) qua middleware \`verifyJWT\`.
- **Refresh Token (Dài hạn: 7 ngày):** Lưu trong **HttpOnly, Secure, SameSite Cookie** để JavaScript phía trình duyệt (\`document.cookie\`) không thể đọc được, giảm thiểu rủi ro bị đánh cắp qua XSS.

## 2. Luồng Silent Refresh với Axios Interceptor

Khi Access Token hết hạn, API trả về mã \`401 Unauthorized\`. Thay vì bắt người dùng đăng nhập lại giữa chừng khi đang làm bài thi:

\`\`\`javascript
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const { data } = await axios.post(
        '/api/v1/auth/refresh-token',
        {},
        { withCredentials: true }
      );
      setAccessToken(data.accessToken);
      originalRequest.headers.Authorization = \`Bearer \${data.accessToken}\`;
      return axiosClient(originalRequest);
    }
    return Promise.reject(error);
  }
);
\`\`\`

## 3. Phân quyền RBAC tại tầng Route Express

Sau bước \`verifyJWT\`, middleware \`authorizeRoles('admin', 'contributor')\` sẽ kiểm tra \`req.user.role\` trước khi cho phép đi vào Controller phê duyệt câu hỏi.`,
  },
  {
    _id: 'art_algo_two_pointers_hash_04',
    title: 'Kỹ thuật Hash Map & Sliding Window trong Phỏng vấn Thuật toán',
    slug: 'ky-thuat-hash-map-va-sliding-window-trong-phong-van-thuat-toan',
    summary:
      'Cách giảm độ phức tạp thời gian từ O(n²) xuống O(n) cho các bài toán tìm kiếm cặp số, kiểm tra chuỗi con không lặp và giới hạn tần suất request.',
    level: 'Intern',
    category: 'Backend',
    tags: ['Algorithms', 'JavaScript', 'Python', 'Java', 'C++'],
    readingTimeMinutes: 7,
    updatedAt: '2026-11-10',
    author: 'Ban Chuyên môn DevPrep',
    questionIds: ['q_coding_two_sum_07', 'q_coding_longest_substr_08'],
    content: `## 1. Khi nào nên thay vòng lặp lồng nhau bằng Hash Map?

Trong các buổi phỏng vấn Intern / Fresher, lỗi phổ biến nhất là dùng 2 vòng lặp \`for\` lồng nhau dẫn đến độ phức tạp thời gian \`O(n²)\`, gây lỗi **Time Limit Exceeded (TLE)** trên các bộ Test Cases ẩn có kích thước mảng lớn.

Bằng cách dùng \`Map\` hoặc \`Set\` trong JavaScript (hoặc \`dict\` trong Python), thao tác tra cứu phần tử bù chỉ tốn \`O(1)\` trung bình.

## 2. Mẫu chuẩn bài toán Two Sum với Map

\`\`\`javascript
function twoSum(nums, target) {
  const seenIndex = new Map();

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seenIndex.has(complement)) {
      return [seenIndex.get(complement), i];
    }
    seenIndex.set(nums[i], i);
  }
  return [];
}
\`\`\`

## 3. Mẫu chuẩn cửa sổ trượt (Sliding Window)

Khi bài toán yêu cầu tìm **đoạn con liên tiếp dài nhất / ngắn nhất** thỏa mãn điều kiện (ví dụ: chuỗi con dài nhất không có ký tự lặp lại), hãy duy trì hai con trỏ \`left\` và \`right\`:
- Mở rộng \`right\` ở mỗi bước để đưa phần tử mới vào cửa sổ.
- Khi điều kiện vi phạm, thu hẹp \`left\` cho đến khi cửa sổ hợp lệ trở lại.`,
  },
  {
    _id: 'art_node_strategy_grading_05',
    title: 'Áp dụng Strategy Pattern xây dựng Động cơ Chấm điểm Đa định dạng',
    slug: 'ap-dung-strategy-pattern-xay-dung-dong-co-cham-diem-da-dinh-dang',
    summary:
      'Thiết kế kiến trúc chấm bài tách biệt rõ 3 luồng MCQ, Fill-in-the-blank và Coding Sandbox mà không biến Service thành khối điều kiện if/else khổng lồ.',
    level: 'Middle',
    category: 'Backend',
    tags: ['Node.js', 'ExpressJS', 'System Design'],
    readingTimeMinutes: 11,
    updatedAt: '2026-11-12',
    author: 'Ban Chuyên môn DevPrep',
    questionIds: ['q_mcq_strategy_pattern_09'],
    content: `## 1. Vấn đề của khối lệnh switch-case khi mở rộng định dạng câu hỏi

Khi nền tảng hỗ trợ nhiều loại câu hỏi (\`mcq\`, \`fill_blank\`, \`coding\`), nếu viết toàn bộ logic chấm điểm vào chung một hàm \`gradeSubmission()\`, hàm này sẽ vừa phải xử lý chuỗi, vừa so sánh tập hợp ID, vừa gọi HTTP sang Piston Sandbox API. Điều này vi phạm nguyên lý **Single Responsibility** và **Open/Closed Principle**.

## 2. Cấu trúc Strategy Pattern trong \`server/src/services/grading/\`

Mỗi chiến lược chấm điểm được đóng gói thành một module độc lập có cùng chữ ký hàm \`evaluate(question, userAnswer)\`:

\`\`\`javascript
// services/grading/index.js
import { mcqStrategy } from './mcq.strategy.js';
import { fillBlankStrategy } from './fillBlank.strategy.js';
import { codingStrategy } from './coding.strategy.js';

const strategies = {
  mcq: mcqStrategy,
  fill_blank: fillBlankStrategy,
  coding: codingStrategy,
};

export async function gradeQuestion(question, submissionPayload) {
  const strategy = strategies[question.type];
  if (!strategy) {
    throw new Error(\`Unsupported question type: \${question.type}\`);
  }
  return strategy.evaluate(question, submissionPayload);
}
\`\`\`

## 3. Lợi ích thực tế khi vận hành

- Dễ dàng viết Unit Test độc lập cho \`fillBlankStrategy\` (chuẩn hóa khoảng trắng, chữ hoa/thường) mà không cần mock kết nối Sandbox.
- Đảm bảo an toàn tuyệt đối: code người dùng chỉ đi qua \`codingStrategy\` -> \`sandbox.service.js\` (gọi Piston API có timeout 3–5 giây), không bao giờ thực thi trực tiếp trên tiến trình Express.`,
  },
  {
    _id: 'art_fe_html_tailwind_06',
    title: 'Bố cục Responsive hiện đại với Semantic HTML5, CSS Grid và Tailwind CSS',
    slug: 'bo-cuc-responsive-hien-dai-voi-semantic-html5-css-grid-va-tailwind-css',
    summary:
      'Tổng hợp các câu hỏi phỏng vấn thực chiến về Semantic HTML, khả năng tiếp cận (Accessibility), cách kết hợp Flexbox/Grid và tối ưu lớp tiện ích trong Tailwind CSS.',
    level: 'Intern',
    category: 'Frontend',
    tags: ['HTML/CSS', 'Tailwind CSS', 'ReactJS'],
    readingTimeMinutes: 6,
    updatedAt: '2026-11-12',
    author: 'Ban Chuyên môn DevPrep',
    questionIds: ['q_mcq_html_tailwind_12'],
    content: `## 1. Tại sao Semantic HTML luôn được hỏi ở vòng phỏng vấn Frontend?

Sử dụng đúng thẻ ngữ nghĩa (\`<header>\`, \`<nav>\`, \`<main>\`, \`<article>\`, \`<section>\`, \`<dialog>\`) giúp trình đọc màn hình (Screen Reader) xây dựng cây Accessibility chính xác và cải thiện SEO tự nhiên mà không cần lạm dụng thuộc tính \`role\` thủ công.

## 2. Khi nào chọn Flexbox và khi nào chọn CSS Grid trong Tailwind CSS?

- **Flexbox (\`flex\`, \`items-center\`, \`justify-between\`):** Phù hợp cho bố cục **1 chiều** (thanh điều hướng, cụm nút bấm, căn giữa nội dung trong thẻ).
- **CSS Grid (\`grid\`, \`grid-cols-1 md:grid-cols-3\`, \`gap-6\`):** Phù hợp cho bố cục **2 chiều** cần kiểm soát đồng thời cả hàng và cột (lưới danh sách thẻ khóa học, bảng điều khiển Dashboard).

\`\`\`html
<section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
  <article class="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between">
    <h3 class="text-base font-bold text-slate-900">Tiêu đề thẻ</h3>
    <p class="text-sm text-slate-600 line-clamp-2">Nội dung mô tả ngắn gọn...</p>
  </article>
</section>
\`\`\``,
  },
  {
    _id: 'art_be_java_python_07',
    title: 'So sánh Quản lý Bộ nhớ, Đa luồng và OOP trong Java (Spring Boot) & Python',
    slug: 'so-sanh-quan-ly-bo-nho-da-luong-va-oop-trong-java-spring-boot-va-python',
    summary:
      'Ôn tập trọng tâm phỏng vấn Backend về JVM Garbage Collection, String Pool, Dependency Injection trong Spring Boot và cơ chế GIL, List Comprehension trong Python.',
    level: 'Fresher',
    category: 'Backend',
    tags: ['Java', 'Python', 'Spring Boot', 'SQL'],
    readingTimeMinutes: 9,
    updatedAt: '2026-11-13',
    author: 'Ban Chuyên môn DevPrep',
    questionIds: ['q_mcq_java_oop_13', 'q_fill_python_comp_14'],
    content: `## 1. Điểm cốt lõi khi phỏng vấn Java & Spring Boot

- **Hợp đồng \`equals()\` và \`hashCode()\`:** Khi sử dụng đối tượng làm khóa trong \`HashMap\` hoặc phần tử trong \`HashSet\`, nếu ghi đè \`equals()\` thì bắt buộc phải ghi đè \`hashCode()\` để đảm bảo hai đối tượng bằng nhau luôn rơi vào cùng một bucket băm.
- **IoC & Dependency Injection trong Spring Boot:** Khuyến nghị sử dụng **Constructor Injection** thay vì Field Injection (\`@Autowired\` trực tiếp trên biến) để đảm bảo tính bất biến (\`final\`) và dễ viết Unit Test.

## 2. Điểm cốt lõi khi phỏng vấn Python

- **Mutable Default Arguments:** Tránh đặt giá trị mặc định của tham số hàm là một danh sách khả biến (\`def append_item(val, items=[]):\`) vì danh sách mặc định chỉ được khởi tạo một lần duy nhất khi định nghĩa hàm.
- **List & Dict Comprehension:** Giúp biến đổi dữ liệu ngắn gọn và nhanh hơn vòng lặp \`for\` thông thường nhờ tối ưu ở tầng bytecode CPython.`,
  },
  {
    _id: 'art_mobile_kotlin_swift_08',
    title: 'Bất đồng bộ và Quản lý Bộ nhớ trên Mobile: Kotlin Coroutines & Swift ARC',
    slug: 'bat-dong-bo-va-quan-ly-bo-nho-tren-mobile-kotlin-coroutines-va-swift-arc',
    summary:
      'Hệ thống hóa các câu hỏi phỏng vấn Mobile Developer về Null Safety, Dispatchers trong Kotlin Coroutines và cơ chế Automatic Reference Counting (ARC), Struct vs Class trong Swift.',
    level: 'Junior',
    category: 'Mobile',
    tags: ['Kotlin', 'Swift', 'React Native'],
    readingTimeMinutes: 8,
    updatedAt: '2026-11-13',
    author: 'Ban Chuyên môn DevPrep',
    questionIds: ['q_mcq_kotlin_coroutines_15', 'q_mcq_swift_arc_16'],
    content: `## 1. Kotlin Coroutines trên Android

- **Structured Concurrency:** Sử dụng \`viewModelScope\` hoặc \`lifecycleScope\` để tự động hủy các tác vụ ngầm khi màn hình bị hủy, tránh rò rỉ bộ nhớ.
- **Chọn đúng Dispatcher:**
  - \`Dispatchers.Main\`: Cập nhật giao diện người dùng (UI).
  - \`Dispatchers.IO\`: Gọi mạng (Retrofit), đọc/ghi cơ sở dữ liệu Room hoặc tệp tin.
  - \`Dispatchers.Default\`: Xử lý tính toán nặng trên CPU (sắp xếp danh sách lớn, phân tích JSON lớn).

## 2. Quản lý bộ nhớ ARC và Value Type trong Swift (iOS)

- **Struct (Value Type) vs Class (Reference Type):** Trong Swift, \`struct\` được sao chép khi gán và lưu trên Stack (hoặc inline), an toàn khi dùng đa luồng. \`class\` chia sẻ tham chiếu trên Heap và được quản lý bởi **ARC (Automatic Reference Counting)**.
- **Phòng tránh Retain Cycle:** Khi hai đối tượng giữ tham chiếu mạnh (\`strong\`) lẫn nhau hoặc bên trong escaping closure, cần khai báo \`[weak self]\` hoặc \`unowned\` để giải phóng bộ nhớ đúng lúc.`,
  },
];
