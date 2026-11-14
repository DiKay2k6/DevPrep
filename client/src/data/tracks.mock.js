export const LEVELS = [
  {
    id: 'Intern',
    label: 'Intern',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500',
    experience: 'Sinh viên năm 3–4 / Mới bắt đầu',
    focus: 'Nắm vững cú pháp ngôn ngữ, cấu trúc dữ liệu cơ bản, HTML/CSS/JS nền tảng và truy vấn SQL đơn giản.',
    targetQuestionCount: 55,
  },
  {
    id: 'Fresher',
    label: 'Fresher',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    dotClass: 'bg-blue-600',
    experience: '0 – 1 năm kinh nghiệm thực tế',
    focus: 'Thành thạo ReactJS, RESTful API với Express/Spring Boot, bất đồng bộ (Async/Await), Git workflow và thiết kế bảng DB.',
    targetQuestionCount: 70,
  },
  {
    id: 'Junior',
    label: 'Junior',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    dotClass: 'bg-amber-500',
    experience: '1 – 2.5 năm kinh nghiệm',
    focus: 'Tối ưu hiệu năng render, bảo mật JWT/RBAC, đánh Index MongoDB/SQL, quản lý luồng bất đồng bộ Mobile/Web và viết code sạch.',
    targetQuestionCount: 85,
  },
  {
    id: 'Middle',
    label: 'Middle',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    dotClass: 'bg-purple-600',
    experience: '2.5 – 4+ năm kinh nghiệm',
    focus: 'Kiến trúc phân tầng, Strategy/Factory Pattern, Aggregation Pipeline phức tạp, System Design và xử lý tải cao.',
    targetQuestionCount: 65,
  },
];

export const SKILL_GROUPS = [
  {
    id: 'languages',
    title: 'Ngôn ngữ lập trình',
    description: 'Cú pháp cốt lõi, quản lý bộ nhớ, hướng đối tượng và xử lý đa luồng',
    skills: [
      { id: 'JavaScript', label: 'JavaScript (ES6+)' },
      { id: 'Java', label: 'Java Core & OOP' },
      { id: 'Python', label: 'Python' },
      { id: 'C++', label: 'C / C++' },
    ],
  },
  {
    id: 'frontend',
    title: 'Frontend Web',
    description: 'Bố cục hiện đại, cơ chế trình duyệt, thư viện giao diện và bảo mật phía Client',
    skills: [
      { id: 'HTML/CSS', label: 'HTML5 & CSS3' },
      { id: 'Tailwind CSS', label: 'Tailwind CSS' },
      { id: 'ReactJS', label: 'ReactJS & Hooks' },
      { id: 'Web Security', label: 'Web Security (XSS/CSRF)' },
    ],
  },
  {
    id: 'backend',
    title: 'Backend & API',
    description: 'Xây dựng RESTful API, xác thực người dùng, kiến trúc phân tầng và thiết kế hệ thống',
    skills: [
      { id: 'Node.js', label: 'Node.js Runtime' },
      { id: 'ExpressJS', label: 'ExpressJS' },
      { id: 'Spring Boot', label: 'Spring Boot' },
      { id: 'JWT Auth', label: 'JWT & Phân quyền' },
      { id: 'System Design', label: 'System Design' },
    ],
  },
  {
    id: 'mobile',
    title: 'Mobile App',
    description: 'Phát triển ứng dụng di động gốc (Native) và quản lý vòng đời, bất đồng bộ trên thiết bị',
    skills: [
      { id: 'Kotlin', label: 'Kotlin (Android)' },
      { id: 'Swift', label: 'Swift (iOS)' },
      { id: 'React Native', label: 'React Native' },
    ],
  },
  {
    id: 'database_tools',
    title: 'Database & Công cụ',
    description: 'Tối ưu hóa truy vấn dữ liệu, thuật toán phỏng vấn và quản lý mã nguồn',
    skills: [
      { id: 'MongoDB', label: 'MongoDB & Indexing' },
      { id: 'SQL', label: 'SQL & Hệ quản trị quan hệ' },
      { id: 'Git', label: 'Git & Quy trình làm việc' },
      { id: 'Algorithms', label: 'Cấu trúc dữ liệu & Thuật toán' },
    ],
  },
];

export const ALL_SKILLS = SKILL_GROUPS.flatMap((group) =>
  group.skills.map((skill) => ({ ...skill, groupId: group.id, groupTitle: group.title }))
);

export const CAREER_TRACKS = [
  {
    id: 'Frontend',
    title: 'Frontend Engineering',
    subtitle: 'HTML/CSS, Tailwind CSS, JavaScript, ReactJS & Tối ưu hiển thị',
    description:
      'Làm chủ bố cục Responsive với HTML/Tailwind CSS, cơ chế Event Loop trong JavaScript, quản lý trạng thái ReactJS và phòng chống XSS.',
    articleCount: 16,
    questionCount: 72,
    coreTags: ['JavaScript', 'HTML/CSS', 'Tailwind CSS', 'ReactJS', 'Web Security'],
    milestones: {
      Intern: ['Semantic HTML5, Flexbox/Grid & Tailwind CSS căn bản', 'Kiểu dữ liệu, Scope & Hoisting trong JavaScript', 'Props, State & Component trong ReactJS'],
      Fresher: ['Closure, Event Loop & bất đồng bộ Promise/Async', 'useEffect, useMemo & Custom Hooks trong ReactJS', 'Thiết kế giao diện Responsive chuẩn Accessibility'],
      Junior: ['Cơ chế Reconciliation & tối ưu re-render', 'Phòng chống XSS, CSRF trên ứng dụng SPA', 'Tối ưu Core Web Vitals & chia nhỏ gói tải'],
      Middle: ['Kiến trúc trạng thái quy mô lớn', 'Xử lý rò rỉ bộ nhớ & uỷ quyền sự kiện', 'Thiết kế Design System đồng nhất'],
    },
  },
  {
    id: 'Backend',
    title: 'Backend Engineering',
    subtitle: 'Node.js, ExpressJS, Java, Python, Spring Boot & Bảo mật API',
    description:
      'Tập trung vào kiến trúc phân tầng, lập trình hướng đối tượng với Java/Python, xây dựng REST API bằng Node.js/Express hoặc Spring Boot và xác thực JWT.',
    articleCount: 18,
    questionCount: 78,
    coreTags: ['Node.js', 'ExpressJS', 'Java', 'Python', 'Spring Boot'],
    milestones: {
      Intern: ['Cú pháp hướng đối tượng Java/Python & HTTP căn bản', 'Express Routing & Middleware cơ bản', 'Biến môi trường & kiến trúc phân tầng'],
      Fresher: ['Xác thực JWT Access/Refresh Token & bcryptjs', 'Quản lý bộ nhớ JVM, GIL trong Python & Event Loop', 'Xử lý lỗi tập trung & kiểm tra dữ liệu đầu vào'],
      Junior: ['Strategy Pattern cho nghiệp vụ chấm điểm đa hình', 'Rate Limiting, Helmet, CORS & chống Brute-force', 'Cô lập tiến trình & tích hợp Sandbox Proxy'],
      Middle: ['Idempotency, xử lý đồng thời & Graceful Shutdown', 'Tối ưu thông lượng I/O & thiết kế chịu lỗi', 'Kiến trúc hệ thống phân tán & theo dõi nhật ký'],
    },
  },
  {
    id: 'Full-stack',
    title: 'Full-stack Web Development',
    subtitle: 'Kết nối End-to-End từ ReactJS Client đến Server API & Database',
    description:
      'Kết nối mạch lạc luồng dữ liệu giữa Client và Server: Axios Interceptor tự động làm mới token, bảo mật dữ liệu thi cử và đồng bộ trạng thái.',
    articleCount: 12,
    questionCount: 54,
    coreTags: ['ReactJS', 'ExpressJS', 'JWT Auth', 'MongoDB', 'Git'],
    milestones: {
      Intern: ['Luồng Request/Response giữa ReactJS và ExpressJS', 'Quản lý trạng thái biểu mẫu & hiển thị Loading/Error', 'Quy trình quản lý nhánh mã nguồn với Git'],
      Fresher: ['Axios Interceptor tự động đính kèm Bearer Token', 'Phân quyền hiển thị giao diện theo vai trò', 'Thiết kế dữ liệu đa hình cho bài tập thực hành'],
      Junior: ['Cơ chế Silent Refresh Token khi gặp mã lỗi 401', 'Chống lộ đáp án bằng Projection tại tầng Database', 'Đồng bộ tiến độ làm bài giữa Client và Server'],
      Middle: ['Thiết kế động cơ chấm bài tự động đa định dạng', 'Tối ưu độ trễ toàn trình & chiến lược bộ nhớ đệm', 'Kiểm thử tích hợp & tự động hóa triển khai'],
    },
  },
  {
    id: 'Mobile',
    title: 'Mobile Development (iOS & Android)',
    subtitle: 'Kotlin, Swift, Coroutines, Quản lý bộ nhớ ARC & Kiến trúc MVVM',
    description:
      'Chuẩn bị phỏng vấn lập trình di động gốc trên Android (Kotlin, Coroutines, Jetpack) và iOS (Swift, Value/Reference Types, ARC, Concurrency).',
    articleCount: 10,
    questionCount: 44,
    coreTags: ['Kotlin', 'Swift', 'React Native', 'Java'],
    milestones: {
      Intern: ['Null Safety trong Kotlin & Optionals trong Swift', 'Vòng đời màn hình Activity/Fragment & UIViewController', 'Bố cục giao diện di động thích ứng nhiều kích thước'],
      Fresher: ['Bất đồng bộ với Kotlin Coroutines & Swift Async/Await', 'Phân biệt Struct (Value Type) và Class (Reference Type)', 'Giao tiếp mạng RESTful API và lưu trữ cục bộ'],
      Junior: ['Quản lý bộ nhớ ARC trong Swift & tránh Retain Cycle', 'Kiến trúc MVVM, StateFlow và điều phối luồng dữ liệu', 'Tối ưu cuộn danh sách dài và thời lượng pin'],
      Middle: ['Thiết kế kiến trúc Modular hóa đa tính năng', 'Bảo mật lưu trữ Keychain/Keystore trên thiết bị', 'Xử lý chế độ Offline-first và đồng bộ nền'],
    },
  },
  {
    id: 'Database',
    title: 'Database & Thuật toán Tối ưu',
    subtitle: 'MongoDB, SQL, Đánh chỉ mục ESR, Aggregation & Cấu trúc dữ liệu',
    description:
      'Thiết kế lược đồ dữ liệu linh hoạt, đánh Compound Index đúng thứ tự ESR, viết truy vấn SQL/Aggregation hiệu năng cao và giải thuật phỏng vấn.',
    articleCount: 14,
    questionCount: 52,
    coreTags: ['MongoDB', 'SQL', 'Algorithms', 'System Design'],
    milestones: {
      Intern: ['Truy vấn CRUD cơ bản trong SQL và MongoDB', 'Cấu trúc dữ liệu mảng, bảng băm (Hash Map) & hai con trỏ', 'Các kiểu chỉ mục đơn và khóa ngoại'],
      Fresher: ['Thiết kế Polymorphic Schema cho dữ liệu đa hình', 'Sử dụng Projection (.select) để ẩn trường nhạy cảm', 'Kỹ thuật Cửa sổ trượt (Sliding Window) tối ưu O(n)'],
      Junior: ['Compound Index theo quy tắc ESR (Equality-Sort-Range)', 'Aggregation Pipeline ($match, $group, $lookup, $unwind)', 'Phân tích kế hoạch thực thi truy vấn chậm'],
      Middle: ['Tối ưu bộ nhớ cho tập dữ liệu lớn & Index Intersection', 'Chiến lược lưu trữ lịch sử nộp bài & ôn tập ngắt quãng', 'Giao dịch (Transaction) & kiểm soát ghi đồng thời'],
    },
  },
];

export const MOCK_USER = {
  _id: 'usr_devprep_01',
  fullName: 'Nguyễn Duy Khang',
  email: 'khang.nguyen.dev@gmail.com',
  role: 'admin',
  targetLevel: 'Junior',
  targetTrack: 'Full-stack',
  selectedSkills: [
    'JavaScript',
    'ReactJS',
    'Tailwind CSS',
    'Node.js',
    'MongoDB',
    'Java',
  ],
  bio: 'Kỹ sư phát triển phần mềm đang ôn luyện phỏng vấn chuyên sâu theo nhóm kỹ năng Web, Backend và Database.',
  joinedAt: '2026-09-15',
  stats: {
    streakDays: 12,
    solvedQuestions: 38,
    totalSubmissions: 64,
    accuracyRate: 78,
    completedMockTests: 5,
    readArticles: 19,
  },
};

export const MOCK_USER_PROFILE = MOCK_USER;
