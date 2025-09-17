// =================================================================
// QUAN TRỌNG: YÊU CẦU HÀNH ĐỘNG
// =================================================================
// 1. Đi đến Cài đặt Dự án (Project Settings) trên Firebase của bạn.
// 2. Trong tab "Chung" (General), cuộn xuống mục "Ứng dụng của bạn" (Your apps).
// 3. Tìm ứng dụng web của bạn và nhấp vào biểu tượng thiết lập và cấu hình SDK (</>).
// 4. Sao chép đối tượng `firebaseConfig` và dán vào đây, thay thế các giá trị giữ chỗ.
// =================================================================

export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID" // Tùy chọn
};
