export const QUESTIONS_MOCK = [
  {
    _id: 'q_mcq_event_loop_01',
    title: 'Thứ tự ưu tiên giữa Microtask Queue và Macrotask Queue',
    prompt:
      'Trong môi trường JavaScript Runtime (Browser / Node.js), phát biểu nào dưới đây là ĐÚNG về cách Event Loop xử lý các hàng đợi bất đồng bộ?',
    type: 'mcq',
    level: 'Fresher',
    category: 'Frontend',
    tags: ['JavaScript', 'ReactJS', 'Node.js'],
    status: 'approved',
    codeSnippet: `console.log('A');
setTimeout(() => console.log('B'), 0);
Promise.resolve().then(() => console.log('C'));
console.log('D');`,
    payload: {
      isMultiple: true,
      options: [
        {
          id: 'opt_a',
          text: 'Sau khi Call Stack trống, Event Loop sẽ thực thi toàn bộ callback trong Microtask Queue trước khi lấy tác vụ tiếp theo từ Macrotask Queue.',
        },
        {
          id: 'opt_b',
          text: 'setTimeout(fn, 0) luôn được thực thi ngay lập tức trước Promise.then() vì thời gian chờ bằng 0ms.',
        },
        {
          id: 'opt_c',
          text: 'Đoạn code minh họa bên trên sẽ in ra màn hình theo thứ tự: A -> D -> C -> B.',
        },
        {
          id: 'opt_d',
          text: 'Callback của Promise.then() được xếp vào Macrotask Queue cùng với setInterval.',
        },
      ],
      correctOptionIds: ['opt_a', 'opt_c'],
    },
    explanation:
      'Code đồng bộ (A và D) chạy trực tiếp trên Call Stack trước. Khi Call Stack rỗng, Event Loop ưu tiên dọn sạch toàn bộ Microtask Queue (Promise.then -> in C) rồi mới lấy tác vụ từ Macrotask Queue (setTimeout -> in B). Do đó đáp án đúng là opt_a và opt_c.',
    relatedArticleId: 'art_js_event_loop_01',
  },
  {
    _id: 'q_fill_event_loop_02',
    title: 'Dự đoán kết quả thực thi bất đồng bộ (Output Prediction)',
    prompt:
      'Cho đoạn chương trình JavaScript bên dưới. Hãy điền chính xác chuỗi kết quả in ra trên một dòng (các giá trị cách nhau bởi một khoảng trắng, ví dụ: "1 2 3 4").',
    type: 'fill_blank',
    level: 'Intern',
    category: 'Frontend',
    tags: ['JavaScript', 'Event Loop', 'Async'],
    status: 'approved',
    codeSnippet: `const out = [];
out.push('1');

setTimeout(() => {
  out.push('2');
  console.log(out.join(' '));
}, 0);

Promise.resolve()
  .then(() => out.push('3'))
  .then(() => out.push('4'));

out.push('5');`,
    payload: {
      placeholder: 'Nhập chuỗi kết quả, ví dụ: 1 5 3 4 2',
      caseSensitive: false,
      acceptedAnswers: ['1 5 3 4 2', '1, 5, 3, 4, 2'],
    },
    explanation:
      'Bước đồng bộ đẩy "1" và "5" vào mảng trước. Tiếp theo, 2 nhánh .then() liên tiếp trong Microtask Queue đẩy "3" rồi "4" vào mảng. Cuối cùng callback của setTimeout (Macrotask) mới chạy, đẩy "2" vào mảng và in ra "1 5 3 4 2".',
    relatedArticleId: 'art_js_event_loop_01',
  },
  {
    _id: 'q_mcq_mongo_esr_03',
    title: 'Thiết kế Compound Index theo quy tắc ESR trong MongoDB',
    prompt:
      'Giả sử Backend thường xuyên thực thi truy vấn lọc câu hỏi đã duyệt theo cấp độ, sắp xếp mới nhất và lọc theo khoảng điểm khó như đoạn code dưới đây. Thứ tự khai báo Compound Index nào tối ưu nhất theo quy tắc ESR (Equality - Sort - Range)?',
    type: 'mcq',
    level: 'Junior',
    category: 'Database',
    tags: ['MongoDB', 'SQL', 'System Design'],
    status: 'approved',
    codeSnippet: `db.questions.find({
  status: 'approved',
  level: 'Junior',
  difficultyScore: { $gte: 50, $lte: 80 }
}).sort({ createdAt: -1 });`,
    payload: {
      isMultiple: false,
      options: [
        {
          id: 'opt_1',
          text: '{ difficultyScore: 1, createdAt: -1, status: 1, level: 1 }',
        },
        {
          id: 'opt_2',
          text: '{ status: 1, level: 1, createdAt: -1, difficultyScore: 1 }',
        },
        {
          id: 'opt_3',
          text: '{ createdAt: -1, difficultyScore: 1, status: 1, level: 1 }',
        },
        {
          id: 'opt_4',
          text: '{ status: 1, difficultyScore: 1, level: 1, createdAt: -1 }',
        },
      ],
      correctOptionIds: ['opt_2'],
    },
    explanation:
      'Theo quy tắc ESR: các trường so sánh bằng chính xác (Equality: status, level) phải đứng đầu, tiếp theo là trường sắp xếp (Sort: createdAt) để tránh in-memory sort, và cuối cùng là trường lọc theo khoảng (Range: difficultyScore).',
    relatedArticleId: 'art_mongo_compound_index_02',
  },
  {
    _id: 'q_fill_mongo_select_04',
    title: 'Ẩn đáp án đúng bằng Mongoose Projection (Anti-Cheating)',
    prompt:
      'Trong Mongoose, để loại bỏ trường `payload.correctOptionIds` khỏi kết quả trả về khi gọi `Question.find(filter).select(...)`, chuỗi đối số cần truyền vào hàm `.select()` là gì?',
    type: 'fill_blank',
    level: 'Fresher',
    category: 'Full-stack',
    tags: ['MongoDB', 'Node.js', 'ExpressJS'],
    status: 'approved',
    codeSnippet: `const questions = await Question.find({ status: 'approved' })
  .select('____________________________')
  .lean();`,
    payload: {
      placeholder: 'Ví dụ: -fieldName',
      caseSensitive: true,
      acceptedAnswers: [
        '-payload.correctOptionIds',
        '-payload.correctOptionIds -payload.acceptedAnswers',
      ],
    },
    explanation:
      'Dấu trừ (-) phía trước đường dẫn trường trong `.select("-payload.correctOptionIds")` yêu cầu MongoDB loại bỏ (exclude) trường nhạy cảm ngay tại tầng Database trước khi trả dữ liệu về Express và Client.',
    relatedArticleId: 'art_mongo_compound_index_02',
  },
  {
    _id: 'q_mcq_jwt_security_05',
    title: 'Bảo mật Refresh Token và cơ chế Silent Refresh',
    prompt:
      'Khi thiết kế hệ thống xác thực JWT cho ứng dụng MERN Stack, phương án lưu trữ và làm mới token nào dưới đây giúp giảm thiểu rủi ro bị đánh cắp Refresh Token qua lỗ hổng XSS?',
    type: 'mcq',
    level: 'Junior',
    category: 'Full-stack',
    tags: ['JWT Auth', 'ReactJS', 'ExpressJS', 'Web Security'],
    status: 'approved',
    codeSnippet: null,
    payload: {
      isMultiple: false,
      options: [
        {
          id: 'opt_a',
          text: 'Lưu cả Access Token và Refresh Token trong localStorage để tiện đọc bằng JavaScript.',
        },
        {
          id: 'opt_b',
          text: 'Lưu Refresh Token trong HttpOnly + Secure Cookie và dùng Axios Response Interceptor tự động gọi endpoint làm mới khi gặp mã 401.',
        },
        {
          id: 'opt_c',
          text: 'Đính kèm Refresh Token trên URL Query String của mọi request GET.',
        },
        {
          id: 'opt_d',
          text: 'Đặt thời hạn Access Token là 365 ngày để không cần dùng Refresh Token.',
        },
      ],
      correctOptionIds: ['opt_b'],
    },
    explanation:
      'Cookie có cờ HttpOnly không thể bị truy cập bởi `document.cookie` khi xảy ra XSS. Kết hợp Access Token ngắn hạn và Axios Interceptor giúp trải nghiệm người dùng liền mạch mà vẫn an toàn.',
    relatedArticleId: 'art_auth_jwt_refresh_03',
  },
  {
    _id: 'q_coding_two_sum_07',
    title: 'Tìm cặp chỉ số có tổng bằng Target (Two Sum O(n))',
    prompt:
      'Cho mảng số nguyên `nums` và một số nguyên `target`. Hãy trả về mảng gồm 2 chỉ số `[i, j]` (với `i < j`) sao cho `nums[i] + nums[j] === target`. Yêu cầu độ phức tạp thời gian O(n) bằng bảng băm (Hash Map).',
    type: 'coding',
    level: 'Intern',
    category: 'Backend',
    tags: ['Algorithms', 'JavaScript', 'Python', 'Java', 'C++'],
    status: 'approved',
    codeSnippet: `// Input: nums = [2, 7, 11, 15], target = 9
// Output: [0, 1] (vì nums[0] + nums[1] = 2 + 7 = 9)`,
    payload: {
      functionName: 'twoSum',
      supportedLanguages: ['javascript', 'python', 'java', 'cpp'],
      starterCode: {
        javascript: `function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) {
      return [seen.get(need), i];
    }
    seen.set(nums[i], i);
  }
  return [];
}`,
        python: `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        need = target - num
        if need in seen:
            return [seen[need], i]
        seen[num] = i
    return []`,
        java: `import java.util.*;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int need = target - nums[i];
            if (seen.containsKey(need)) {
                return new int[]{ seen.get(need), i };
            }
            seen.put(nums[i], i);
        }
        return new int[]{};
    }
}`,
        cpp: `#include <vector>
#include <unordered_map>
using namespace std;

vector<int> twoSum(const vector<int>& nums, int target) {
    unordered_map<int, int> seen;
    for (int i = 0; i < (int)nums.size(); i++) {
        int need = target - nums[i];
        if (seen.count(need)) return {seen[need], i};
        seen[nums[i]] = i;
    }
    return {};
}`,
      },
      testCases: [
        {
          id: 'tc_1',
          input: 'nums = [2, 7, 11, 15], target = 9',
          expectedOutput: '[0, 1]',
          isHidden: false,
        },
        {
          id: 'tc_2',
          input: 'nums = [3, 2, 4], target = 6',
          expectedOutput: '[1, 2]',
          isHidden: false,
        },
        {
          id: 'tc_3',
          input: 'nums = [-4, 0, 4, 9], target = 0',
          expectedOutput: '[0, 2]',
          isHidden: false,
        },
        {
          id: 'tc_4_hidden',
          input: 'nums = [1000000, -500000, 500000], target = 500000',
          expectedOutput: '[0, 1]',
          isHidden: true,
        },
      ],
    },
    explanation:
      'Sử dụng một Hash Map lưu giá trị đã duyệt kèm chỉ số của nó. Ở mỗi phần tử `nums[i]`, kiểm tra xem `target - nums[i]` đã xuất hiện trong Map chưa. Mỗi phần tử chỉ duyệt qua đúng 1 lần nên độ phức tạp thời gian là O(n) và bộ nhớ là O(n).',
    relatedArticleId: 'art_algo_two_pointers_hash_04',
  },
  {
    _id: 'q_coding_longest_substr_08',
    title: 'Độ dài chuỗi con dài nhất không lặp ký tự (Sliding Window)',
    prompt:
      'Cho một chuỗi `s`, hãy tìm độ dài của chuỗi con liên tiếp dài nhất không chứa bất kỳ ký tự nào lặp lại. Áp dụng kỹ thuật Cửa sổ trượt (Sliding Window) với độ phức tạp O(n).',
    type: 'coding',
    level: 'Junior',
    category: 'Frontend',
    tags: ['Algorithms', 'JavaScript', 'Python', 'Java', 'C++'],
    status: 'approved',
    codeSnippet: `// Input: s = "abcabcbb" -> Output: 3 ("abc")
// Input: s = "pwwkew"   -> Output: 3 ("wke")`,
    payload: {
      functionName: 'lengthOfLongestSubstring',
      supportedLanguages: ['javascript', 'python', 'java', 'cpp'],
      starterCode: {
        javascript: `function lengthOfLongestSubstring(s) {
  const lastIndex = new Map();
  let left = 0;
  let maxLen = 0;

  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    if (lastIndex.has(ch) && lastIndex.get(ch) >= left) {
      left = lastIndex.get(ch) + 1;
    }
    lastIndex.set(ch, right);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}`,
        python: `def length_of_longest_substring(s: str) -> int:
    last_index = {}
    left = 0
    max_len = 0
    for right, ch in enumerate(s):
        if ch in last_index and last_index[ch] >= left:
            left = last_index[ch] + 1
        last_index[ch] = right
        max_len = max(max_len, right - left + 1)
    return max_len`,
        java: `import java.util.*;

class Solution {
    public int lengthOfLongestSubstring(String s) {
        Map<Character, Integer> lastIndex = new HashMap<>();
        int left = 0, maxLen = 0;
        for (int right = 0; right < s.length(); right++) {
            char ch = s.charAt(right);
            if (lastIndex.containsKey(ch) && lastIndex.get(ch) >= left) {
                left = lastIndex.get(ch) + 1;
            }
            lastIndex.put(ch, right);
            maxLen = Math.max(maxLen, right - left + 1);
        }
        return maxLen;
    }
}`,
        cpp: `#include <string>
#include <unordered_map>
#include <algorithm>
using namespace std;

int lengthOfLongestSubstring(const string& s) {
    unordered_map<char, int> lastIndex;
    int left = 0, maxLen = 0;
    for (int right = 0; right < (int)s.size(); right++) {
        char ch = s[right];
        if (lastIndex.count(ch) && lastIndex[ch] >= left) {
            left = lastIndex[ch] + 1;
        }
        lastIndex[ch] = right;
        maxLen = max(maxLen, right - left + 1);
    }
    return maxLen;
}`,
      },
      testCases: [
        {
          id: 'tc_s1',
          input: 's = "abcabcbb"',
          expectedOutput: '3',
          isHidden: false,
        },
        {
          id: 'tc_s2',
          input: 's = "bbbbb"',
          expectedOutput: '1',
          isHidden: false,
        },
        {
          id: 'tc_s3',
          input: 's = "pwwkew"',
          expectedOutput: '3',
          isHidden: false,
        },
        {
          id: 'tc_s4_hidden',
          input: 's = "devprep_interview_2026"',
          expectedOutput: '9',
          isHidden: true,
        },
      ],
    },
    explanation:
      'Duy trì cửa sổ trượt `[left, right]` và bảng băm lưu vị trí xuất hiện gần nhất của từng ký tự. Khi gặp ký tự đã nằm trong cửa sổ hiện tại (`lastIndex.get(ch) >= left`), dịch trực tiếp `left` sang `lastIndex.get(ch) + 1`.',
    relatedArticleId: 'art_algo_two_pointers_hash_04',
  },
  {
    _id: 'q_mcq_strategy_pattern_09',
    title: 'Kiến trúc Strategy Pattern và Bảo mật Thực thi Code trên Backend',
    prompt:
      'Trong kiến trúc chấm điểm tự động của hệ thống Backend (Node.js/Express), những nguyên tắc thiết kế nào dưới đây BẮT BUỘC phải tuân thủ?',
    type: 'mcq',
    level: 'Middle',
    category: 'Backend',
    tags: ['ExpressJS', 'Strategy Pattern', 'System Design', 'Rate Limit'],
    status: 'approved',
    codeSnippet: null,
    payload: {
      isMultiple: true,
      options: [
        {
          id: 'opt_s1',
          text: 'Tách riêng từng chiến lược chấm điểm (mcq, fill_blank, coding) theo Strategy Pattern với giao diện hàm evaluate thống nhất.',
        },
        {
          id: 'opt_s2',
          text: 'Sử dụng hàm eval() hoặc child_process.exec() trực tiếp trên Express Server để biên dịch code của người dùng nhanh hơn.',
        },
        {
          id: 'opt_s3',
          text: 'Mọi yêu cầu biên dịch code phải đi qua Express Proxy sang Piston Sandbox cô lập, kèm Rate Limit và giới hạn Timeout 3–5 giây.',
        },
        {
          id: 'opt_s4',
          text: 'Viết trực tiếp các truy vấn Mongoose phức tạp ngay bên trong file routes/ để giảm số lượng file.',
        },
      ],
      correctOptionIds: ['opt_s1', 'opt_s3'],
    },
    explanation:
      'Tuyệt đối cấm dùng `eval()` hay `child_process` chạy code người dùng trên server Express vì rủi ro Remote Code Execution (RCE). Mọi luồng chạy code phải qua Proxy tới Sandbox cô lập, có rate limit và timeout; đồng thời chấm điểm phải tách theo Strategy Pattern.',
    relatedArticleId: 'art_node_strategy_grading_05',
  },
  {
    _id: 'q_pending_closure_leak_10',
    title: 'Phân tích Closure và Rò rỉ bộ nhớ trong React useEffect',
    prompt:
      'Khi sử dụng setInterval hoặc đăng ký event listener bên trong useEffect mà quên trả về hàm cleanup, hiện tượng gì sẽ xảy ra với Closure và bộ nhớ khi component unmount?',
    type: 'mcq',
    level: 'Junior',
    category: 'Frontend',
    tags: ['React Hooks', 'Closure', 'JavaScript'],
    status: 'pending',
    submittedBy: 'tran.minh.contributor@devprep.vn',
    submittedAt: '2026-11-13 09:30',
    codeSnippet: `useEffect(() => {
  const timer = setInterval(() => {
    console.log('Polling state:', count);
  }, 1000);
  // Thiếu return () => clearInterval(timer);
}, []);`,
    payload: {
      isMultiple: false,
      options: [
        {
          id: 'opt_p1',
          text: 'React tự động hủy mọi setInterval của window khi component unmount.',
        },
        {
          id: 'opt_p2',
          text: 'Callback của setInterval vẫn giữ tham chiếu tới Lexical Environment (Stale Closure), gây rò rỉ bộ nhớ (Memory Leak).',
        },
        {
          id: 'opt_p3',
          text: 'Biến count tự động cập nhật giá trị mới nhất dù mảng dependency là [].',
        },
      ],
      correctOptionIds: ['opt_p2'],
    },
    explanation:
      'Khi không dọn dẹp timer trong hàm cleanup của useEffect, bộ định thời vẫn tồn tại trong Web API và giữ tham chiếu tới scope của lần render đầu tiên (Stale Closure + Memory Leak).',
    relatedArticleId: 'art_js_event_loop_01',
  },
  {
    _id: 'q_pending_mongo_agg_11',
    title: 'Thống kê tỷ lệ đúng theo Tag bằng MongoDB Aggregation Pipeline',
    prompt:
      'Điền tên toán tử giai đoạn (stage operator, bắt đầu bằng dấu $) dùng để tách mảng `tags` thành từng document riêng biệt trước khi `$group` thống kê tỷ lệ làm bài.',
    type: 'fill_blank',
    level: 'Middle',
    category: 'Database',
    tags: ['MongoDB', 'Aggregation', 'Query Tuning'],
    status: 'pending',
    submittedBy: 'le.hoang.dba@devprep.vn',
    submittedAt: '2026-11-13 15:45',
    codeSnippet: `Submission.aggregate([
  { $match: { userId: currentUserId } },
  { $lookup: { from: 'questions', localField: 'questionId', foreignField: '_id', as: 'q' } },
  { ________: '$q' },
  { ________: '$q.tags' },
  { $group: { _id: '$q.tags', total: { $sum: 1 }, passed: { $sum: { $cond: ['$isCorrect', 1, 0] } } } }
]);`,
    payload: {
      placeholder: 'Ví dụ: $unwind',
      caseSensitive: true,
      acceptedAnswers: ['$unwind'],
    },
    explanation:
      'Toán tử `$unwind` giúp phẳng hóa (deconstruct) một trường kiểu mảng trong document thành nhiều document riêng cho từng phần tử, giúp `$group` thống kê chính xác theo từng tag.',
    relatedArticleId: 'art_mongo_compound_index_02',
  },
  {
    _id: 'q_mcq_html_tailwind_12',
    title: 'Semantic HTML5 & Thiết kế Bố cục Đáp ứng với Tailwind CSS',
    prompt:
      'Những phát biểu nào dưới đây là ĐÚNG khi xây dựng giao diện Web hiện đại kết hợp Semantic HTML5 và Tailwind CSS?',
    type: 'mcq',
    level: 'Intern',
    category: 'Frontend',
    tags: ['HTML/CSS', 'Tailwind CSS', 'ReactJS'],
    status: 'approved',
    codeSnippet: `<section class="grid grid-cols-1 md:grid-cols-3 gap-6">
  <article class="bg-white border border-slate-200 rounded-2xl p-5">
    <h2 class="text-base font-bold text-slate-900">Tiêu đề thẻ</h2>
  </article>
</section>`,
    payload: {
      isMultiple: true,
      options: [
        {
          id: 'opt_ht1',
          text: 'Các tiền tố sm:, md:, lg: trong Tailwind CSS hoạt động theo nguyên tắc Mobile-first (áp dụng từ kích thước màn hình đó trở lên).',
        },
        {
          id: 'opt_ht2',
          text: 'Sử dụng thẻ <button type="button"> cho các nút tương tác giúp hỗ trợ điều hướng bàn phím (Tab, Enter, Space) tự nhiên mà không cần viết lại bằng thẻ <div>.',
        },
        {
          id: 'opt_ht3',
          text: 'Lớp grid-cols-1 md:grid-cols-3 chỉ có tác dụng trên màn hình điện thoại và tự động ẩn phần tử trên màn hình máy tính.',
        },
        {
          id: 'opt_ht4',
          text: 'Mọi ô nhập liệu <input> trong biểu mẫu bắt buộc phải gắn với thẻ <label> để đảm bảo khả năng tiếp cận (Accessibility).',
        },
      ],
      correctOptionIds: ['opt_ht1', 'opt_ht2', 'opt_ht4'],
    },
    explanation:
      'Tailwind CSS áp dụng triết lý Mobile-first: lớp mặc định áp dụng cho mọi màn hình, còn md:grid-cols-3 kích hoạt khi chiều rộng viewport từ 768px trở lên. Kết hợp thẻ ngữ nghĩa <button> và <label> giúp đạt chuẩn Accessibility.',
    relatedArticleId: 'art_fe_html_tailwind_06',
  },
  {
    _id: 'q_mcq_java_oop_13',
    title: 'Hợp đồng equals() / hashCode() trong Java và Dependency Injection trong Spring Boot',
    prompt:
      'Khi phát triển ứng dụng Backend bằng Java và Spring Boot, phát biểu nào dưới đây là CHÍNH XÁC nhất?',
    type: 'mcq',
    level: 'Fresher',
    category: 'Backend',
    tags: ['Java', 'Spring Boot', 'SQL'],
    status: 'approved',
    codeSnippet: `@Service
public class OrderService {
    private final PaymentGateway paymentGateway;

    public OrderService(PaymentGateway paymentGateway) {
        this.paymentGateway = paymentGateway;
    }
}`,
    payload: {
      isMultiple: false,
      options: [
        {
          id: 'opt_jv1',
          text: 'Hai đối tượng trả về true khi so sánh bằng equals() có thể có hai giá trị hashCode() hoàn toàn khác nhau mà vẫn hoạt động đúng trong HashMap.',
        },
        {
          id: 'opt_jv2',
          text: 'Constructor Injection giúp khai báo phụ thuộc là bất biến (final), phát hiện sớm lỗi vòng lặp phụ thuộc (Circular Dependency) và dễ dàng khởi tạo trong Unit Test.',
        },
        {
          id: 'opt_jv3',
          text: 'Từ khóa final trên một biến tham chiếu đối tượng trong Java ngăn chặn mọi thay đổi trạng thái bên trong đối tượng đó.',
        },
        {
          id: 'opt_jv4',
          text: 'Annotation @RestController trong Spring Boot chỉ dùng để trả về giao diện HTML tĩnh từ máy chủ.',
        },
      ],
      correctOptionIds: ['opt_jv2'],
    },
    explanation:
      'Constructor Injection là phương pháp tiêm phụ thuộc được khuyến nghị trong Spring Boot vì cho phép dùng trường final và không cần khởi chạy toàn bộ Spring Container khi viết Unit Test.',
    relatedArticleId: 'art_be_java_python_07',
  },
  {
    _id: 'q_fill_python_comp_14',
    title: 'Dự đoán kết quả thực thi List Comprehension và Slicing trong Python',
    prompt:
      'Cho đoạn chương trình Python bên dưới. Hãy điền chính xác chuỗi kết quả in ra màn hình console (ví dụ: [0, 4, 16]).',
    type: 'fill_blank',
    level: 'Intern',
    category: 'Backend',
    tags: ['Python', 'Algorithms'],
    status: 'approved',
    codeSnippet: `nums = [1, 2, 3, 4, 5, 6]
evens_squared = [x ** 2 for x in nums if x % 2 == 0]
print(evens_squared[:2])`,
    payload: {
      placeholder: 'Ví dụ: [4, 16]',
      caseSensitive: false,
      acceptedAnswers: ['[4, 16]', '[4,16]', '4 16'],
    },
    explanation:
      'Biểu thức `[x ** 2 for x in nums if x % 2 == 0]` lọc các số chẵn (2, 4, 6) và bình phương chúng thành `[4, 16, 36]`. Phép cắt lát `[:2]` lấy 2 phần tử đầu tiên nên kết quả in ra là `[4, 16]`.',
    relatedArticleId: 'art_be_java_python_07',
  },
  {
    _id: 'q_mcq_kotlin_coroutines_15',
    title: 'Quản lý luồng thực thi với Dispatchers trong Kotlin Coroutines (Android)',
    prompt:
      'Trong phát triển ứng dụng Android bằng Kotlin, khi cần gọi REST API hoặc truy vấn cơ sở dữ liệu Room mà không làm đơ luồng giao diện chính (Main Thread), bạn nên chuyển ngữ cảnh sang Dispatcher nào?',
    type: 'mcq',
    level: 'Junior',
    category: 'Mobile',
    tags: ['Kotlin', 'React Native'],
    status: 'approved',
    codeSnippet: `viewModelScope.launch {
    val profile = withContext(Dispatchers.IO) {
        userRepository.fetchUserProfile()
    }
    _uiState.value = ProfileUiState.Success(profile)
}`,
    payload: {
      isMultiple: false,
      options: [
        {
          id: 'opt_kt1',
          text: 'Dispatchers.Main — chuyên dùng để chạy các tác vụ đọc/ghi mạng nặng trực tiếp trên luồng vẽ giao diện.',
        },
        {
          id: 'opt_kt2',
          text: 'Dispatchers.IO — được tối ưu hóa với bể luồng co giãn dành riêng cho các tác vụ vào/ra (Network, Disk, Database).',
        },
        {
          id: 'opt_kt3',
          text: 'Dispatchers.Unconfined — bắt buộc dùng cho mọi thao tác cập nhật TextView trên Android.',
        },
        {
          id: 'opt_kt4',
          text: 'Thread.sleep(5000) trực tiếp trong hàm onCreate() của Activity.',
        },
      ],
      correctOptionIds: ['opt_kt2'],
    },
    explanation:
      '`Dispatchers.IO` được thiết kế chuyên biệt để giảm tải các tác vụ chặn I/O (gọi API, đọc/ghi DB, đọc file) ra khỏi Main Thread, sau đó trả kết quả an toàn về `viewModelScope` để cập nhật trạng thái giao diện.',
    relatedArticleId: 'art_mobile_kotlin_swift_08',
  },
  {
    _id: 'q_mcq_swift_arc_16',
    title: 'Phòng tránh Retain Cycle trong Swift với Automatic Reference Counting (ARC)',
    prompt:
      'Trong lập trình iOS với Swift, nguyên nhân nào dẫn đến rò rỉ bộ nhớ (Retain Cycle) khi sử dụng Closure và cách khắc phục chuẩn là gì?',
    type: 'mcq',
    level: 'Junior',
    category: 'Mobile',
    tags: ['Swift', 'React Native'],
    status: 'approved',
    codeSnippet: `final class ProfileViewModel {
    var onLoaded: (() -> Void)?

    func loadData() {
        networkClient.fetch { [weak self] in
            self?.renderProfile()
        }
    }
    func renderProfile() {}
}`,
    payload: {
      isMultiple: false,
      options: [
        {
          id: 'opt_sw1',
          text: 'Sử dụng danh sách bắt giữ [weak self] hoặc [unowned self] trong escaping closure để tránh việc đối tượng và closure giữ tham chiếu mạnh (strong reference) lẫn nhau.',
        },
        {
          id: 'opt_sw2',
          text: 'Swift sử dụng bộ thu gom rác (Garbage Collector) chạy định kỳ giống hệt JVM nên không bao giờ xảy ra Retain Cycle.',
        },
        {
          id: 'opt_sw3',
          text: 'Mọi kiểu dữ liệu khai báo bằng từ khóa struct trong Swift đều được cấp phát trên Heap và quản lý bởi ARC.',
        },
        {
          id: 'opt_sw4',
          text: 'Từ khóa weak bắt buộc áp dụng cho các kiểu giá trị cơ bản như Int, Double và Bool.',
        },
      ],
      correctOptionIds: ['opt_sw1'],
    },
    explanation:
      'Swift quản lý bộ nhớ của các kiểu tham chiếu (Class, Closure) lúc biên dịch bằng ARC. Khi một đối tượng giữ closure và closure lại bắt giữ mạnh `self`, bộ đếm tham chiếu không bao giờ về 0. Khai báo `[weak self]` giúp phá vỡ vòng tham chiếu mạnh này.',
    relatedArticleId: 'art_mobile_kotlin_swift_08',
  },
];
