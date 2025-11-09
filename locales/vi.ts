
export default {
  "common": {
    "cancel": "Hủy",
    "copy": "Sao chép",
    "copied": "Đã sao chép!"
  },
  "header": {
    "title": "Trung tâm Video YouTube",
    "projects": "Dự án",
    "automation": "Tự động hóa",
    "calendar": "Lịch",
    "admin": "Quản trị",
    "openSettings": "Mở cài đặt",
    "toggleTheme": "Chuyển đổi giao diện",
    "logout": "Đăng xuất"
  },
  "login": {
    "titleLine1": "Trung tâm Video",
    "titleLine2": "YouTube",
    "tagline": "Bảng điều khiển tất cả trong một để quản lý, theo dõi và tối ưu hóa quy trình sản xuất video của bạn.",
    "signInTitle": "Đăng nhập",
    "signInPrompt": "Đăng nhập để truy cập các dự án của bạn.",
    "signInButton": "Đăng nhập",
    "signInWithGoogle": "Đăng nhập bằng Google",
    "createAccountButton": "Tạo tài khoản",
    "signInTab": "Đăng nhập",
    "registerTab": "Đăng ký",
    "email": "Địa chỉ Email",
    "password": "Mật khẩu",
    "orContinueWith": "Hoặc tiếp tục với",
    "securityNote": "Đăng nhập bằng Tài khoản Google của bạn để lưu và đồng bộ hóa các dự án của bạn một cách an toàn trên các thiết bị.",
    "setupGuide": {
      "title": "Hướng dẫn Cài đặt Lần đầu",
      "intro": "Nếu đăng nhập thất bại, vui lòng hoàn thành các bước cài đặt một lần sau trong dự án Firebase và Google Cloud của bạn.",
      "step1Title": "Bước 1: Bật Phương thức Đăng nhập",
      "step1Desc": "Trong Firebase, đi tới Xác thực -> Phương thức đăng nhập và bật nhà cung cấp 'Google' và 'Email/Mật khẩu'.",
      "step1Button": "Mở Phương thức Đăng nhập",
      "step2Title": "Bước 2: Ủy quyền Tên miền của bạn",
      "step2Desc": "Trong cài đặt Xác thực Firebase, hãy thêm tên miền ứng dụng của bạn vào danh sách 'Miền được ủy quyền'.",
      "step2Button": "Mở Cài đặt Xác thực",
      "step3Title": "Bước 3: Cấu hình OAuth trên Google Cloud",
      "step3Desc": "Đây là cách khắc phục phổ biến nhất. Đi tới thông tin xác thực của dự án Google Cloud, tìm ID OAuth 'Web client' và thêm các URI chính xác.",
      "step3Button": "Mở Google Cloud Credentials"
    }
  },
  "pending": {
    "title": "Tài khoản Chờ Phê duyệt",
    "message": "Tài khoản của bạn đã được tạo và đang chờ quản trị viên phê duyệt. Vui lòng quay lại sau."
  },
  "expired": {
    "title": "Đăng ký Đã Hết hạn",
    "message": "Quyền truy cập vào ứng dụng của bạn đã hết hạn. Vui lòng liên hệ với quản trị viên để gia hạn."
  },
  "dbError": {
    "title": "Yêu cầu Hành động: Hoàn tất Cài đặt Cơ sở dữ liệu",
    "intro": "Không thể kết nối đến Firestore. Đây là lỗi cấu hình phổ biến và thường xảy ra nếu cơ sở dữ liệu chưa được tạo hoặc các quy tắc bảo mật đang chặn quyền truy cập. Vui lòng làm theo các bước sau để khắc phục.",
    "howToFixTitle": "Hướng dẫn Khắc phục sự cố",
    "step1": {
      "title": "Bước 1: Tạo Cơ sở dữ liệu Firestore (Phổ biến nhất)",
      "description": "Nguyên nhân hàng đầu là do dự án Firebase của bạn chưa có cơ sở dữ liệu Firestore. Hãy tạo một cái.",
      "instruction1": "Nhấp vào nút bên dưới để mở trang Firestore.",
      "instruction2": "Nhấp vào \"Tạo cơ sở dữ liệu\" (Create database).",
      "instruction3": "Chọn một vị trí máy chủ (gần người dùng của bạn nhất).",
      "instruction4": "Bắt đầu ở \"chế độ thử nghiệm\" (test mode) để cho phép đọc/ghi trong quá trình phát triển. Bạn có thể thay đổi các quy tắc bảo mật sau.",
      "button": "Mở Bảng điều khiển Firestore"
    },
    "step2": {
      "title": "Bước 2: Kiểm tra Quy tắc Bảo mật",
      "description": "Nếu cơ sở dữ liệu đã tồn tại, các quy tắc bảo mật của bạn có thể đang từ chối quyền truy cập. Hãy làm theo các bước sau để thiết lập quy tắc truy cập an toàn cho mỗi người dùng.",
      "instruction1": "Nhấp vào nút bên dưới để mở tab 'Quy tắc' (Rules) trong Bảng điều khiển Firebase.",
      "instruction2": "Thay thế toàn bộ nội dung trong trình soạn thảo bằng ví dụ an toàn dưới đây. Quy tắc này đảm bảo rằng người dùng đã đăng nhập chỉ có thể đọc và ghi các tài liệu của chính họ.",
      "rulesExampleTitle": "Quy tắc Bảo mật An toàn được Đề xuất",
      "button": "Chỉnh sửa Quy tắc Bảo mật"
    },
    "step3": {
      "title": "Bước 3: Kiểm tra các Hạn chế Khóa API",
      "description": "Ít phổ biến hơn, nhưng khóa API của bạn có thể có các hạn chế (ví dụ: theo IP hoặc tên miền giới thiệu) đang chặn các yêu cầu đến Firestore.",
      "button": "Kiểm tra Khóa API trên Google Cloud"
    },
    "outro": "Sau khi hoàn thành bước 1 (và kiểm tra các bước khác nếu cần), hãy quay lại đây và thử lại.",
    "tryAgainButton": "Thử lại"
  },
  "dbErrorNonAdmin": {
    "title": "Lỗi Kết nối",
    "message": "Ứng dụng không thể kết nối đến cơ sở dữ liệu. Đây có thể là sự cố mạng tạm thời. Vui lòng thử lại sau giây lát.",
    "contactAdmin": "Nếu sự cố vẫn tiếp diễn, vui lòng liên hệ với quản trị viên của bạn.",
    "tryAgainButton": "Thử lại"
  },
  "authConfigError": {
    "title": "Yêu cầu Hành động: Hoàn tất Cài đặt Xác thực",
    "intro": "Đăng nhập không thành công. Đây thường là do sự cố cấu hình Firebase hoặc Google Cloud. Vui lòng xác minh ba cài đặt sau để giải quyết.",
    "copy": "Sao chép",
    "check1": {
      "title": "Kiểm tra 1: Bật Phương thức Đăng nhập Google (Firebase)",
      "desc": "Đảm bảo nhà cung cấp đăng nhập 'Google' đã được bật trong dự án Firebase của bạn. Đây là nguyên nhân phổ biến của lỗi 'operation-not-allowed'.",
      "button": "Mở Phương thức Đăng nhập Firebase"
    },
    "check2": {
      "title": "Kiểm tra 2: Ủy quyền Tên miền Ứng dụng (Firebase)",
      "desc": "Tên miền của ứng dụng phải được thêm vào danh sách các miền được ủy quyền. Đây là nguyên nhân phổ biến nhất của lỗi 'unauthorized-domain'.",
      "domainLabel": "Tên miền hiện tại của bạn là:",
      "button": "Mở Cài đặt Xác thực Firebase"
    },
    "check3": {
      "title": "Kiểm tra 3: Xác minh Cấu hình OAuth (Google Cloud)",
      "desc": "Client ID OAuth 2.0 mà Firebase sử dụng phải có các URI chính xác. Sai lệch ở đây có thể gây ra nhiều lỗi chuyển hướng khác nhau.",
      "note": "Tìm OAuth 2.0 Client ID cho ứng dụng web của bạn (thường có tên 'Web client (auto created by Google Service)'). Đảm bảo các giá trị sau đây đã có.",
      "originsLabel": "Nguồn gốc JavaScript được ủy quyền:",
      "redirectsLabel": "URI chuyển hướng được ủy quyền:",
      "button": "Mở Google Cloud Credentials"
    },
    "outro": "Sau khi xác minh cả ba cài đặt, vui lòng thử đăng nhập lại.",
    "tryAgainButton": "Thử lại"
  },
  "adminPanel": {
    "title": "Bảng điều khiển Admin",
    "description": "Quản lý tài khoản người dùng và các cài đặt chung của ứng dụng.",
    "userManagementTab": "Quản lý Người dùng",
    "promptManagementTab": "Câu lệnh Chung",
    "setupGuideTab": "Hướng dẫn Cài đặt",
    "systemCheckTab": "Kiểm tra Hệ thống",
    "administrator": "Quản trị viên",
    "loadingUsers": "Đang tải danh sách người dùng...",
    "user": "Người dùng",
    "status": "Trạng thái",
    "expiresAt": "Ngày hết hạn",
    "actions": "Hành động",
    "noExpiry": "Không hết hạn",
    "save": "Lưu",
    "saving": "Đang lưu...",
    "statuses": {
      "active": "Hoạt động",
      "pending": "Chờ duyệt",
      "expired": "Hết hạn"
    },
    "toasts": {
      "userUpdated": "Đã cập nhật người dùng '{{name}}' thành công.",
      "updateFailed": "Cập nhật người dùng '{{name}}' thất bại.",
      "fetchFailed": "Không thể tải danh sách người dùng."
    },
    "permissionError": {
      "title": "Yêu cầu Quyền Admin",
      "intro": "Không thể tải danh sách người dùng vì Quy tắc Bảo mật Firestore đang chặn quyền truy cập. Với tư cách quản trị viên, bạn cần quyền để xem tất cả tài liệu người dùng. Vui lòng cập nhật quy tắc của bạn để cấp quyền.",
      "step1": "Nhấp vào nút bên dưới để đi đến trình chỉnh sửa Quy tắc Firestore trong dự án Firebase của bạn.",
      "button": "Đi đến Quy tắc Firebase",
      "step2": "Thay thế toàn bộ nội dung của trình chỉnh sửa bằng các quy tắc được cập nhật được cung cấp bên dưới.",
      "rulesTitle": "Quy tắc Bảo mật được Cập nhật cho Admin",
      "step3": "Sau khi xuất bản các quy tắc mới, hãy quay lại đây và nhấp vào 'Thử lại'.",
      "retryButton": "Thử lại"
    },
    "firstAdminSetup": {
        "title": "Thiết lập Admin Lần đầu",
        "intro": "Để truy cập Bảng điều khiển Admin, bạn cần cấp quyền admin cho chính tài khoản của mình. Đây là thao tác chỉ thực hiện một lần.",
        "step1": "Đi đến bảng điều khiển Firestore của dự án.",
        "step2": "Điều hướng đến collection 'users'.",
        "step3": "Tìm tài liệu có ID người dùng của bạn.",
        "step4": "Thêm một trường mới: Tên = 'isAdmin', Loại = 'boolean', Giá trị = 'true'.",
        "step5": "Đặt 'status' của bạn thành 'active' và cấp cho mình một ngày 'expiresAt' thật xa.",
        "step6": "Tải lại ứng dụng này. Bây giờ bạn sẽ thấy bảng điều khiển Admin."
    },
    "systemCheck": {
      "title": "Kiểm tra Tình trạng Hệ thống",
      "description": "Công cụ này tự động kiểm tra các sự cố cấu hình phổ biến. Tất cả các mục nên ở trạng thái 'OK' để ứng dụng hoạt động chính xác.",
      "firebaseConfig": {
        "title": "Cấu hình Firebase",
        "ok": "Cấu hình Firebase đã được tải chính xác.",
        "error": "Cấu hình Firebase có vẻ bị thiếu hoặc không hợp lệ. Vui lòng kiểm tra tệp firebaseConfig.ts của bạn."
      },
      "firestore": {
        "title": "Kết nối Cơ sở dữ liệu Firestore",
        "ok": "Đã kết nối thành công đến cơ sở dữ liệu Firestore.",
        "warning": "Đã kết nối, nhưng quy tắc bảo mật có thể quá nghiêm ngặt. Các hành động của quản trị viên có thể thất bại.",
        "error": "Không thể kết nối đến Firestore. Cơ sở dữ liệu có thể chưa được tạo hoặc không thể truy cập.",
        "resolution": "Đi đến Firestore"
      },
      "adminStatus": {
        "title": "Trạng thái Tài khoản Admin",
        "ok": "Tài khoản của bạn có quyền quản trị viên.",
        "error": "Tài khoản của bạn không có quyền quản trị viên. Bạn cần đặt 'isAdmin: true' trên tài liệu người dùng của mình trong Firestore.",
        "resolution": "Đi đến Tài liệu Người dùng"
      },
      "apiKeys": {
        "title": "Khóa API",
        "ok": "Khóa API YouTube đã có trong cài đặt cục bộ.",
        "warning": "Thiếu khóa API YouTube. Các tính năng như lấy thống kê video sẽ không hoạt động cho đến khi được thiết lập trong cài đặt chính."
      },
      "sharingIndex": {
        "title": "Chỉ mục Cơ sở dữ liệu cho Chia sẻ",
        "ok": "Chỉ mục Firestore cần thiết cho việc chia sẻ kênh đã có.",
        "error": "Thiếu chỉ mục Firestore cần thiết cho việc chia sẻ kênh. Người dùng sẽ không thấy được các kênh được chia sẻ với họ.",
        "resolution": "Tạo Chỉ mục"
      }
    }
  },
  "adminPrompts": {
    "title": "Quản lý Câu lệnh Chung",
    "description": "Chỉnh sửa các mẫu câu lệnh (prompt) mặc định được sử dụng bởi Công cụ Tự động hóa AI cho tất cả người dùng. Các thay đổi được lưu tại đây sẽ trở thành mặc định mới.",
    "saveButton": "Lưu Tất cả Thay đổi",
    "savingButton": "Đang lưu...",
    "saveSuccess": "Đã cập nhật câu lệnh chung thành công.",
    "saveError": "Không thể lưu câu lệnh chung.",
    "resetPrompt": "Reset về Gốc",
    "confirmReset": "Xác nhận Reset"
  },
  "projects": {
    "title": "Dự án theo Kênh",
    "manageChannels": "Quản lý Kênh",
    "addChannel": "Thêm Kênh Mới",
    "addVideo": "Thêm Video Mới",
    "manageDream100": "Quản lý Dream 100",
    "loading": "Đang tải dự án...",
    "noChannels": "Chưa có Kênh nào",
    "getStartedChannels": "Thêm kênh đầu tiên của bạn trong Cài đặt để bắt đầu.",
    "noProjectsInChannel": "Chưa có dự án video nào trong kênh này.",
    "subscribers": "Người đăng ký",
    "totalViews": "Tổng lượt xem",
    "videos": "Video",
    "sharedBy": "Được chia sẻ bởi {{name}}",
    "owner": "(Chủ sở hữu)",
    "missingIndexError": {
      "title": "Yêu cầu Hành động: Tạo Chỉ mục Cơ sở dữ liệu",
      "createButton": "Nhấp vào đây để tạo chỉ mục trong Firebase"
    }
  },
  "dashboard": {
    "totalProjects": "Tổng số Dự án",
    "publishedVideos": "Video đã Xuất bản",
    "totalViews": "Tổng Lượt xem",
    "avgLikes": "Thích TB / Video"
  },
  "calendar": {
    "title": "Lịch Nội dung",
    "today": "Hôm nay"
  },
  "projectCard": {
    "thumbnailAlt": "Hình thu nhỏ của video",
    "views": "lượt xem",
    "likes": "lượt thích",
    "comments": "bình luận",
    "local": "Đã lưu trên máy",
    "cloud": "Đã lưu trên đám mây",
    "assignedTo": "Phụ trách bởi"
  },
  "projectTasks": {
    "title": "Danh sách công việc",
    "checkVoice": "Check Voice",
    "createVoice": "Tạo Voice",
    "createImage": "Tạo ảnh"
  },
  "projectModal": {
    "createTitle": "Tạo dự án mới",
    "editTitle": "Chỉnh sửa dự án",
    "tabContent": "Nội dung",
    "tabPublishing": "Xuất bản",
    "tabThumbnail": "Ảnh bìa",
    "tabAiAssets": "Tài sản AI",
    "tabStats": "Thống kê",
    "deleteConfirmation": "Xác nhận Xóa",
    "clearFormConfirmation": "Xác nhận Làm trống",
    "projectName": "Tên dự án",
    "videoTitle": "Tiêu đề Video",
    "script": "Dàn ý Kịch bản (từ AI)",
    "scriptPlaceholder": "Kết quả từ Bước 1 Tự động hóa (Tạo dàn ý) sẽ xuất hiện ở đây...",
    "voiceoverScript": "Kịch bản Lồng tiếng (VO)",
    "voiceoverScriptPlaceholder": "Kịch bản lồng tiếng do AI tạo...",
    "visualPrompts": "Prompt Hình ảnh",
    "visualPromptsPlaceholder": "Prompt hình ảnh từ Bước 6 sẽ xuất hiện ở đây...",
    "promptTable": "Bảng Prompt",
    "promptTablePlaceholder": "Bảng prompt do AI tạo...",
    "timecodeMap": "Bản đồ Timecode",
    "timecodeMapPlaceholder": "Bản đồ timecode do AI tạo...",
    "metadata": "Metadata",
    "metadataPlaceholder": "Lưu trữ ghi chú thêm, dữ liệu JSON, hoặc bất kỳ thông tin liên quan nào khác tại đây...",
    "seoMetadata": "SEO Metadata",
    "seoMetadataPlaceholder": "Hồ sơ SEO và metadata FFmpeg do AI tạo...",
    "description": "Mô tả",
    "tags": "Thẻ (Tags)",
    "addTagPlaceholder": "Thêm thẻ...",
    "publishDate": "Ngày & Giờ xuất bản",
    "status": "Trạng thái",
    "assignedTo": "Người phụ trách",
    "unassigned": "Chưa giao",
    "thumbnail": "Hình thu nhỏ (Thumbnail)",
    "thumbnailPreview": "Xem trước hình thu nhỏ",
    "uploadOrPaste": "Nhấp để tải lên hoặc dán hình ảnh",
    "uploadHint": "PNG, JPG, GIF tối đa 10MB",
    "thumbnailPrompt": "Prompt tạo hình thu nhỏ",
    "thumbnailPromptPlaceholder": "VD: Một con robot đang cầm một chiếc ván trượt màu đỏ.",
    "generate": "Tạo",
    "generateImage": "Tạo ảnh",
    "pinnedComment": "Bình luận đã ghim",
    "communityPost": "Bài đăng cộng đồng",
    "facebookPost": "Bài đăng Facebook",
    "youtubeLink": "Đường dẫn YouTube",
    "performanceStats": "Thống kê hiệu suất",
    "setApiKey": "Vui lòng đặt khóa API YouTube của bạn trong Cài đặt để xem số liệu thống kê.",
    "enterLinkForStats": "Nhập một đường dẫn YouTube hợp lệ để xem số liệu thống kê.",
    "delete": "Xóa",
    "deleting": "Đang xóa...",
    "clearForm": "Xóa nội dung",
    "copy": "Sao chép",
    "rerunAutomation": "Chạy lại Tự động hóa",
    "exportToSheet": "Xuất ra Sheet",
    "move": "Chuyển Kênh",
    "moveDisabledLocal": "Không thể chuyển dự án cục bộ. Vui lòng lưu lên đám mây trước.",
    "moveToChannel": "Chuyển đến kênh:",
    "confirmMove": "Xác nhận Chuyển",
    "moveConfirmation": "Bạn có chắc chắn muốn chuyển dự án này sang kênh '{{channelName}}' không?",
    "save": "Lưu dự án",
    "saving": "Đang lưu...",
    "saveToCloud": "Lưu lên Đám mây & Đồng bộ",
    "saveLocal": "Lưu trên máy",
    "saveCloud": "Lưu lên Đám mây"
  },
  "settings": {
    "title": "Cài đặt",
    "aiProvider": {
      "title": "Cài đặt Nhà cung cấp AI",
      "selectProvider": "Chọn Nhà cung cấp AI",
      "selectModel": "Chọn Mô hình AI"
    },
    "youtubeApi": {
      "title": "Cài đặt API YouTube",
      "note": "Cần thiết để lấy số liệu thống kê và chi tiết video. Khóa của bạn được lưu trữ cục bộ trong trình duyệt."
    },
    "youtubeApiKey": "Khóa API YouTube Data v3",
    "apiKeyPlaceholder": "Nhập khóa API của bạn",
    "showApiKey": "Hiển thị khóa API",
    "hideApiKey": "Ẩn khóa API",
    "apiKeyNote": "Khóa API của bạn được lưu trữ cục bộ trong trình duyệt của bạn và không bao giờ được gửi đến máy chủ của chúng tôi.",
    "manageChannels": "Quản lý các Kênh",
    "addChannel": "Thêm Kênh Mới",
    "addingChannel": "Đang thêm kênh...",
    "newChannelName": "Kênh Mới",
    "channelNamePlaceholder": "Nhập Tên Kênh",
    "channelUrl": "URL Kênh YouTube",
    "channelUrlPlaceholder": "VD: https://www.youtube.com/channel/...",
    "deleteChannel": "Xóa Kênh",
    "deleteChannelConfirmation": "Xác nhận Xóa",
    "deleteChannelError": "Không thể xóa kênh đang chứa dự án. Vui lòng di chuyển hoặc xóa các dự án trước.",
    "buildWithAI": "Xây dựng với AI",
    "shareChannel": "Chia sẻ Kênh",
    "channelDnaDescription": "Xác định bản sắc cho từng kênh của bạn để giúp AI tạo ra nội dung theo phong cách hoàn hảo.",
    "save": "Lưu cài đặt",
    "dna": {
      "label": "Hồ sơ kênh",
      "placeholder": "VD: Vai trò của tôi là một Đầu bếp Chuyên nghiệp. Giọng văn của tôi hài hước và truyền cảm hứng. Tôi tạo nội dung cho những người mới bắt đầu nấu ăn tại nhà. Tôi nói về các công thức nấu ăn thuần chay và hướng dẫn JavaScript. Tôi xưng hô với khán giả của mình là 'Chào mọi người!'..."
    }
  },
  "shareModal": {
    "title": "Chia sẻ \"{{channelName}}\"",
    "invite": "Mời",
    "inviting": "Đang mời...",
    "invitePlaceholder": "Nhập địa chỉ email người dùng",
    "members": "Thành viên có quyền truy cập",
    "owner": "Chủ sở hữu",
    "editor": "Người chỉnh sửa",
    "remove": "Xóa",
    "removeConfirm": "Bạn chắc chắn?",
    "you": "Bạn"
  },
  "dream100": {
    "title": "Dream 100: {{channelName}}",
    "addVideo": "Thêm Video",
    "addingVideo": "Đang thêm...",
    "youtubeUrlPlaceholder": "Dán URL YouTube vào đây...",
    "filterByChannel": "Lọc theo Kênh",
    "allChannels": "Tất cả các Kênh",
    "table": {
      "video": "Video",
      "stats": "Thống kê",
      "published": "Ngày đăng",
      "status": "Trạng thái",
      "actions": "Hành động"
    },
    "details": {
      "description": "Mô tả",
      "tags": "Thẻ (Tags)",
      "noTags": "Không có thẻ nào."
    },
    "noVideos": "Chưa có video nào trong danh sách Dream 100 của bạn.",
    "getStarted": "Dán một URL YouTube vào trên để bắt đầu xây dựng danh sách.",
    "deleteConfirmation": "Bạn có chắc chắn muốn xóa video này khỏi danh sách Dream 100 không?",
    "status": {
      "pending": "Chờ phân tích",
      "analyzed": "Đã phân tích",
      "remade": "Đã làm lại"
    },
    "toasts": {
        "videoAdded": "Đã thêm video vào Dream 100!",
        "videoExists": "Video này đã có trong danh sách Dream 100 của bạn.",
        "fetchError": "Không thể lấy chi tiết video. Kiểm tra lại URL và khóa API của bạn.",
        "videoRemoved": "Đã xóa video khỏi danh sách."
    }
  },
   "dream100Selector": {
    "title": "Chọn một Video Viral",
    "searchPlaceholder": "Tìm theo tiêu đề...",
    "noVideos": "Không tìm thấy video Dream 100 nào cho kênh này."
  },
   "channelDnaWizard": {
    "title": "Xây dựng ADN Kênh của bạn",
    "step": "Bước {{current}} trên {{total}}",
    "back": "Quay lại",
    "next": "Tiếp theo",
    "generate": "Tạo ADN",
    "guide": {
      "title": "Hướng dẫn Hoàn thiện ADN Kênh",
      "intro": "Làm theo quy trình này để thu thập dữ liệu cần thiết cho việc xây dựng một ADN Kênh mạnh mẽ. Sự chuẩn bị này đảm bảo AI của chúng tôi có thể tạo ra nội dung hiệu quả và đúng mục tiêu nhất cho bạn.",
      "stepLabel": "Bước {{index}}.",
      "start": "Tôi đã sẵn sàng, Bắt đầu nào",
      "step1_title": "Xác định 'khung xương' kênh",
      "step1_desc": "Trả lời 4 câu hỏi gốc:\n1. Kênh nói về chủ đề gì? (Ngách)\n2. Ai là khán giả chính?\n3. Giá trị cốt lõi kênh mang lại?\n4. Mục tiêu 12 tháng tới là gì?",
      "step2_title": "Vào VidIQ – tìm từ khóa gốc",
      "step2_desc": "Gõ từ khóa gốc của bạn (ví dụ: 'đột quỵ' hoặc 'sức khỏe người cao tuổi'). Sưu tầm 20–30 từ khóa gốc dựa trên Lượng tìm kiếm và Mức độ cạnh tranh.",
      "step3_title": "Lọc bằng Bộ lọc 3 lớp",
      "step3_desc": "Lọc các từ khóa của bạn:\n1. Lượng tìm kiếm có từ 1K–50K/tháng không?\n2. Mức độ cạnh tranh có thấp–trung bình (<40%) không?\n3. Ý định tìm kiếm có giải quyết một vấn đề cấp bách không?\nGiữ lại khoảng 5–10 từ khóa mũi nhọn.",
      "step4_title": "Xây Bản đồ Tác chiến SEO",
      "step4_desc": "Chia từ khóa ra 4 nhóm:\n1. Mũi nhọn: 5–10 từ khóa kim cương.\n2. Hỗ trợ: Từ khóa có lượng tìm kiếm vừa phải, cạnh tranh thấp.\n3. Ngữ cảnh: Từ khóa liên quan rộng để dùng trong mô tả/tag.\n4. Thương hiệu: Tên kênh + slogan của bạn.",
      "step5_title": "Gắn từ khóa vào ADN kênh",
      "step5_desc": "Tích hợp từ khóa vào:\n- Tên kênh + Tagline\n- Mô tả kênh\n- Playlist\n- Tiêu đề video\n- Mô tả video + Tag",
      "step6_title": "Chuẩn hóa ADN nhận diện",
      "step6_desc": "Xác định ADN hình ảnh của bạn:\n- Màu chủ đạo (2–3 mã hex)\n- Font chữ (1 cho tiêu đề, 1 cho nội dung)\n- Format thumbnail (bố cục nhất quán)",
      "step7_title": "Lộ trình 6–12 tháng",
      "step7_desc": "Lập kế hoạch chiến lược nội dung của bạn:\n- 3 tháng đầu: Đăng 30 video để kiểm tra từ khóa.\n- 6 tháng: Nhóm nội dung vào các playlist/cụm chủ đề.\n- 12 tháng: Mở rộng sang các từ khóa liên quan và xây dựng cộng đồng.",
      "checklist": "Mục tiêu của bạn là thu thập thông tin này. Các bước tiếp theo sẽ hỏi bạn về kết quả chính của nghiên cứu này."
    },
    "q1_question": "Chủ đề/Ngách của kênh bạn là gì?",
    "q1_description": "Từ nghiên cứu của bạn, ngách cụ thể mà bạn đang nhắm đến là gì?",
    "q1_placeholder": "VD: 'Sức khỏe cho người cao tuổi trên 60', 'Kỹ thuật phòng chống đột quỵ nâng cao'",
    "q2_question": "Đối tượng mục tiêu của bạn là ai?",
    "q2_description": "Mô tả chi tiết về khán giả lý tưởng của bạn.",
    "q2_placeholder": "VD: 'Người Việt Nam từ 60 tuổi trở lên, quan tâm đến sức khỏe, thích nội dung y tế dễ hiểu.'",
    "q_role_question": "Chủ kênh đóng vai trò gì và xưng hô với khán giả như thế nào?",
    "q_role_description": "Điều này xác định Persona và cách kết nối trực tiếp với người xem, ảnh hưởng đến tông giọng và phong cách của kênh.",
    "q_role_placeholder": "VD: Đóng vai chuyên gia, xưng 'tôi' và gọi khán giả là 'các bạn'. Hoặc đóng vai người đồng hành, xưng 'mình' và gọi khán giả là 'anh chị em'.",
    "q3_question": "Giá trị cốt lõi mà kênh của bạn mang lại là gì?",
    "q3_description": "Bạn giải quyết vấn đề gì cho khán giả của mình?",
    "q3_placeholder": "VD: 'Giúp mọi người sống lâu hơn, khỏe mạnh hơn và tránh đột quỵ bằng cách đơn giản hóa thông tin y tế phức tạp.'",
    "q4_question": "Điểm mạnh nổi bật của kênh bạn là gì?",
    "q4_description": "Điều gì làm bạn khác biệt so với các kênh khác trong cùng lĩnh vực?",
    "q4_placeholder": "VD: 'Tất cả nội dung đều dựa trên nghiên cứu khoa học mới nhất, được trình bày bởi một y tá có đăng ký.'",
    "q5_question": "Mục tiêu của bạn trong 1-3 năm tới là gì?",
    "q5_description": "Hãy cụ thể về các mục tiêu của bạn.",
    "q5_placeholder": "VD: '100 video, 10K người đăng ký, 1 triệu lượt xem trong năm đầu tiên. Trở thành nguồn thông tin đáng tin cậy nhất về sức khỏe người cao tuổi.'",
    "q6_question": "Thời lượng trung bình lý tưởng cho video của bạn là bao nhiêu?",
    "q6_description": "Giúp điều chỉnh nhịp độ và độ dài kịch bản.",
    "q6_placeholder": "VD: 'Khoảng 15-20 phút để có thể giải thích sâu.'",
    "q7_question": "Bạn muốn mô tả video của mình được định dạng như thế nào?",
    "q7_description": "Bạn có một cấu trúc cụ thể hay muốn nó học theo các ví dụ lan truyền?",
    "q7_placeholder": "VD: 'Theo cấu trúc của các video lan truyền: một câu mở đầu hấp dẫn ở dòng đầu tiên, các điểm chính, và một lời kêu gọi hành động rõ ràng.'",
    "q8_question": "Mô tả phong cách hình ảnh minh họa mong muốn của bạn.",
    "q8_description": "Hình ảnh nên trông như thế nào? Nêu rõ định dạng và phong cách.",
    "q8_placeholder": "VD: 'Hình ảnh chân thực về người cao tuổi Việt Nam đa dạng trong bối cảnh gia đình hoặc phòng khám. Tỷ lệ 16:9, độ phân giải 4K.'",
    "q9_question": "Cơ sở khoa học cho nội dung của bạn là gì, nếu có?",
    "q9_description": "Nguồn thông tin và cách trình bày dữ liệu để xây dựng lòng tin là gì?",
    "q9_placeholder": "VD: 'Trích dẫn nguồn từ các tạp chí y khoa uy tín như PubMed. Trình bày dữ liệu rõ ràng, ví dụ: 'Một nghiên cứu năm 2023 từ Đại học Y Hà Nội cho thấy...''",
    "generatingTitle": "Đang tạo ADN của bạn...",
    "generatingMessage": "AI của chúng tôi đang tạo ra bản sắc hoàn hảo cho kênh của bạn. Quá trình này có thể mất một chút thời gian.",
    "resultTitle": "ADN Kênh của bạn đã sẵn sàng!",
    "resultDescription": "Xem lại ADN do AI tạo ra dưới đây. Bạn có thể chỉnh sửa trước khi sử dụng.",
    "useThisDna": "Sử dụng ADN này",
    "regenerate": "Tạo lại",
    "errorTitle": "Đã xảy ra lỗi",
    "retry": "Thử lại",
    "masterPrompt": {
        "template": "ROLE:\nBạn là The World’s #1 Digital DNA Architect for YouTube Channels — bậc thầy thiết kế bản sắc kênh YouTube.\nNhiệm vụ: Nhận dữ liệu đầu vào cơ bản → biến thành một ADN kênh YouTube hoàn chỉnh: độc đáo, khác biệt, thu hút, có tiềm năng bùng nổ.\n\nINPUT (do user cung cấp):\n- Chủ đề/Ngách: {{topic}}\n- Tệp khách hàng mục tiêu: {{audience}}\n- Vai trò & Xưng hô: {{role_and_address}}\n- Giá trị cốt lõi: {{core_value}}\n- Điểm mạnh nổi bật: {{strength}}\n- Mục tiêu 1–3 năm: {{goals}}\n\nBỐI CẢNH BỔ SUNG ĐỂ TẠO NỘI DUNG:\n- Thời lượng video trung bình: {{duration}}\n- Định dạng mô tả ưu tiên: {{description_format}}\n- Phong cách hình ảnh minh họa: {{illustration_style}}\n- Cơ sở khoa học & Cách trình bày dữ liệu: {{scientific_basis}}\n\nOUTPUT (bắt buộc):\n1. **Định vị thương hiệu kênh**\n   - Tagline (ngắn, nhớ ngay)\n   - Câu chuyện thương hiệu (Storytelling)\n   - Tông giọng thương hiệu (Tone of Voice)\n\n2. **Khung nội dung ADN**\n   - 3–5 trụ cột nội dung chính (Pillars)\n   - 5–7 dạng video con (Formats)\n   - Chu kỳ đăng tải (Publishing Rhythm)\n\n3. **Bản đồ SEO & Khách hàng**\n   - Từ khóa mũi nhọn (High-Impact Keywords)\n   - Bộ cụm từ khóa phụ (Clusters)\n   - Chân dung khán giả mục tiêu (Audience Persona)\n\n4. **Nhận diện hình ảnh**\n   - Bộ màu chủ đạo (Mã Hex)\n   - Font chữ (tiêu đề & nội dung)\n   - Gợi ý phong cách thumbnail & banner\n\n5. **Lộ trình tăng trưởng 6–12 tháng**\n   - Chiến lược nội dung đầu vào (Launch Strategy)\n   - Chiến lược giữ chân & cộng đồng\n   - Chiến lược mở rộng & thương hiệu phụ (nếu có)\n\nRULES:\n- Viết ngắn gọn, súc tích, có chiều sâu.\n- Tất cả đều phải dễ áp dụng ngay.\n- Không dùng ngôn ngữ chung chung; mọi chi tiết phải rõ ràng & khác biệt."
    }
  },
  "status": {
    "idea": "💡 Ý tưởng",
    "production": "🎬 Sản xuất",
    "creatingVoiceover": "🎤 Tạo Voice",
    "creatingThumbnail": "🖼️ Tạo Ảnh",
    "optimization": "🔍 Tối ưu hóa",
    "completed": "✅ Hoàn thành",
    "scheduled": "🕒 Chờ Đăng",
    "published": "🚀 Đã xuất bản"
  },
  "automation": {
    "title": "Công cụ Tự động hóa AI",
    "selectChannel": "Chọn Kênh Mục tiêu",
    "selectChannelPlaceholder": "-- Chọn một kênh để bắt đầu --",
    "noChannelsPlaceholder": "-- Chưa có kênh nào được cấu hình --",
    "selectFromDream100": "Chọn từ Dream 100",
    "enableStep": "Bật bước này",
    "disableStep": "Tắt bước này",
    "viralVideo": {
      "title": "Phân tích Video Viral",
      "youtubeLink": "Link YouTube Viral",
      "transcript": "Bản ghi lời (Transcript)",
      "transcriptPlaceholder": "Dán toàn bộ bản ghi lời của video viral vào đây...",
      "fetchedTitle": "Tiêu đề (tự động)",
      "fetchedDescription": "Mô tả (tự động)",
      "fetchedTags": "Thẻ (tự động)"
    },
    "targetVideo": {
      "title": "Video Mới Của Bạn",
      "newTitle": "Tiêu đề Video Định làm",
      "newTitlePlaceholder": "VD: Cách nướng bánh mì sourdough hoàn hảo",
      "nextTitle": "Tên video tiếp theo (Tùy chọn)",
      "nextTitlePlaceholder": "VD: Bí quyết để có lớp vỏ pizza hoàn hảo",
      "wordCount": "Số từ mục tiêu",
      "imageCount": "Số lượng ảnh mục tiêu"
    },
    "srtInput": {
      "label": "Nội dung tệp SRT",
      "placeholder": "Dán toàn bộ nội dung của tệp .srt của bạn vào đây...",
      "prompt": "Vui lòng cung cấp nội dung SRT bên dưới và nhấp 'Tiếp tục chạy' để tiếp tục."
    },
    "runButton": "Chạy chuỗi tự động hóa",
    "runningButton": "Đang chạy...",
    "stopButton": "Dừng chuỗi",
    "stoppingButton": "Đang dừng...",
    "resumeButton": "Tiếp tục chạy",
    "resetChainProgress": "Reset Tiến trình",
    "resetInputs": "Xóa Dữ liệu Đầu vào",
    "resetChainConfirmation": "Bạn có chắc muốn reset tiến trình không? Tất cả kết quả đã tạo sẽ bị xóa, nhưng dữ liệu đầu vào của bạn sẽ được giữ lại.",
    "resetInputsConfirmation": "Bạn có chắc muốn xóa tất cả dữ liệu đầu vào và tiến trình không? Công cụ tự động hóa sẽ được xóa về trạng thái ban đầu.",
    "createProjectButton": "Tạo dự án từ kết quả",
    "ideaBank": "Ngân hàng Ý tưởng",
    "stepLabel": "Bước {{id}}:",
    "expand": "Mở rộng",
    "collapse": "Thu gọn",
    "promptTemplate": "Mẫu câu lệnh (Prompt)",
    "restoreDefaultPrompt": "Khôi phục Gốc",
    "restoreConfirmButton": "Xác nhận Khôi phục",
    "restoreDefaultConfirmation": "Bạn có chắc chắn muốn khôi phục câu lệnh gốc cho bước này không? Mọi thay đổi hiện tại sẽ bị mất.",
    "promptHint": "Bạn có thể chỉnh sửa câu lệnh này. Sử dụng các biến như `{{TARGET_VIDEO_TITLE}}` hoặc `{{VIRAL_VIDEO_TRANSCRIPT}}` để nối các bước.",
    "output": "Kết quả",
    "copyOutput": "Sao chép kết quả",
    "settings": "Cài đặt",
    "rerunStep": "Chạy lại",
    "rerunStepOnly": "Chỉ chạy lại bước này",
    "rerunFromThisStep": "Chạy lại từ bước này",
    "defaultDescription": "Vui lòng xem lại và chỉnh sửa mô tả được tạo tự động.",
    "step1": {
      "name": "Phân tích Viral & Tạo dàn ý",
      "description": "Phân tích cấu trúc của video viral để tạo dàn ý phù hợp cho chủ đề video mới của bạn."
    },
    "step2": {
      "name": "Viết kịch bản đầy đủ",
      "description": "Viết một kịch bản hoàn chỉnh từ dàn ý, phù hợp với giọng văn của kênh và số từ đã chỉ định."
    },
    "step3": {
      "name": "Biên soạn kịch bản lồng tiếng (VO)",
      "description": "Biên soạn kịch bản cuối cùng thành định dạng sạch, sẵn sàng cho diễn viên lồng tiếng, loại bỏ ghi chú sản xuất và thêm thương hiệu."
    },
    "step4": {
      "name": "Phân tích Tiêu đề & Thumbnail",
      "description": "Tạo các tiêu đề và ý tưởng thumbnail hấp dẫn, sau đó phân tích và chọn ra phương án tốt nhất kèm điểm đánh giá."
    },
    "step5": {
      "name": "Gói phân phối SEO",
      "description": "Tạo mô tả, thẻ và bài đăng mạng xã hội, được tự động điền từ bước trước.",
      "inputsTitle": "Ghi đè thủ công",
      "finalTitle": "Tiêu đề cuối cùng",
      "thumbOverlay": "Chữ trên Thumbnail",
      "thumbOverlayL1": "Dòng 1",
      "thumbOverlayL2": "Dòng 2",
      "nextVideoUrl": "URL Video tiếp theo",
      "mainKeywords": "Từ khóa chính (3-6, cách nhau bởi dấu phẩy)"
    },
    "step6": {
      "name": "Tạo Prompt hình ảnh minh họa",
      "description": "Phân tích kịch bản lồng tiếng và ADN Kênh để tạo một bộ hoàn chỉnh các prompt hình ảnh chân thực, phù hợp văn hóa cho video."
    },
    "step7": {
      "name": "Xây dựng bảng Prompt",
      "description": "Chuyển đổi các prompt hình ảnh từ bước trước thành một bảng và khối CSV có cấu trúc."
    },
    "step8": {
      "name": "Tạo SEO & Metadata",
      "description": "Tạo hồ sơ SEO toàn diện và tệp siêu dữ liệu sẵn sàng cho FFmpeg dựa trên tất cả các bước trước."
    },
    "step9": {
      "name": "Ghép nối Timecode từ SRT",
      "description": "Đối chiếu các prompt hình ảnh với dấu thời gian hội thoại từ một tệp SRT được cung cấp để tạo danh sách cảnh quay được đồng bộ hóa."
    }
  },
   "ideaBankModal": {
    "title": "Ngân hàng Ý tưởng",
    "addNewIdea": "Thêm Ý tưởng Mới",
    "addNewIdeaPlaceholder": "Nhập mỗi ý tưởng trên một dòng...",
    "add": "Thêm",
    "table": {
        "title": "Tiêu đề",
        "status": "Trạng thái",
        "actions": "Hành động"
    },
    "status": {
        "notStarted": "Chưa bắt đầu",
        "done": "Hoàn thành",
        "redo": "Làm lại"
    },
    "actions": {
        "useAsMain": "Dùng làm Chủ đề chính",
        "useAsNext": "Dùng làm Chủ đề tiếp theo",
        "delete": "Xóa",
        "editContent": "Sửa Nội dung"
    },
    "contentPlaceholder": "Nhập nội dung chính hoặc ghi chú cho ý tưởng này...",
    "noIdeas": "Chưa có ý tưởng nào. Hãy thêm một ý tưởng ở trên để bắt đầu!",
    "deleteConfirm": "Bạn có chắc chắn muốn xóa ý tưởng này không?"
  },
  "toasts": {
    "fetchProjectsError": "Không thể tải các dự án.",
    "fetchChannelsError": "Không thể tải các kênh.",
    "channelAdded": "Đã thêm kênh thành công!",
    "channelSaveFailed": "Lưu kênh thất bại.",
    "channelDeleted": "Đã xóa kênh thành công.",
    "channelDeleteFailed": "Xóa kênh thất bại.",
    "deleteChannelError": "Không thể xóa kênh đang chứa dự án. Vui lòng di chuyển hoặc xóa các dự án trước.",
    "dream100UpdateFailed": "Cập nhật danh sách Dream 100 thất bại.",
    "dream100VideoSelected": "Đã điền link và mô tả video viral.",
    "ideaBankUpdateFailed": "Cập nhật Ngân hàng Ý tưởng thất bại.",
    "userNotFound": "Không tìm thấy người dùng với email đó.",
    "userAlreadyMember": "Người dùng đã là thành viên của kênh này.",
    "userAdded": "Đã thêm người dùng vào kênh.",
    "userRemoved": "Đã xóa người dùng khỏi kênh.",
    "updateMembersFailed": "Cập nhật thành viên kênh thất bại.",
    "settingsSaved": "Đã lưu cài đặt thành công!",
    "loginRequiredToSave": "Bạn phải đăng nhập để lưu dự án.",
    "loginRequiredToDelete": "Bạn phải đăng nhập để xóa dự án.",
    "projectUpdated": "Đã cập nhật dự án thành công!",
    "projectCreated": "Đã tạo dự án thành công!",
    "projectCopied": "Đã sao chép dự án thành công!",
    "copyingProject": "Đang sao chép dự án...",
    "projectSaveFailed": "Lưu dự án thất bại.",
    "projectDeleted": "Đã xóa dự án.",
    "projectDeleteFailed": "Xóa dự án thất bại.",
    "projectMoved": "Đã chuyển dự án sang kênh '{{channelName}}' thành công.",
    "projectMoveFailed": "Chuyển dự án thất bại.",
    "noChannelsToMove": "Không có kênh nào khác để chuyển dự án này đến.",
    "projectSynced": "Dự án đã được lưu lên đám mây thành công.",
    "projectSyncFailed": "Lưu dự án lên đám mây thất bại.",
    "formCleared": "Các trường trong biểu mẫu đã được xóa.",
    "unauthorizedDomain": "Miền không được ủy quyền. Thêm \"{{domain}}\" vào danh sách miền được ủy quyền của dự án Firebase của bạn.",
    "unsupportedEnvironment": "Đăng nhập thất bại. Môi trường trình duyệt của bạn có thể đang chặn lưu trữ. Hãy thử mở ứng dụng trong một tab mới hoặc kiểm tra cài đặt bảo mật của bạn.",
    "googleSignInNotEnabled": "Lỗi: Vui lòng bật Đăng nhập bằng Google trong cài đặt dự án Firebase của bạn.",
    "signInError": "Đã xảy ra lỗi trong quá trình đăng nhập.",
    "invalidCredentials": "Email hoặc mật khẩu không hợp lệ. Vui lòng thử lại.",
    "emailInUse": "Địa chỉ email này đã được sử dụng bởi một tài khoản khác.",
    "weakPassword": "Mật khẩu phải có ít nhất 6 ký tự.",
    "registrationFailed": "Tạo tài khoản thất bại. Vui lòng thử lại.",
    "logoutDisabledDev": "Chức năng đăng xuất bị tắt trong chế độ phát triển.",
    "loggedOut": "Bạn đã đăng xuất.",
    "logoutFailed": "Đăng xuất thất bại.",
    "milestone": "🎉 Wow! \"{{title}}\" đã đạt hơn 10,000 lượt xem!",
    "aiKeyMissing": "Chưa định cấu hình khóa API {{provider}}. Vui lòng đặt trong Cài đặt.",
    "promptRequired": "Vui lòng nhập prompt cho hình thu nhỏ trước.",
    "imageGenerated": "Đã tạo hình thu nhỏ!",
    "imageGenerateFailed": "Không thể tạo hình ảnh bằng AI.",
    "invalidImageFile": "Vui lòng chọn một tệp hình ảnh hợp lệ.",
    "invalidPublishDate": "Vui lòng cung cấp ngày và giờ xuất bản hợp lệ.",
    "thumbnailTooLarge": "Ảnh thumbnail quá lớn (tối đa 700KB). Vui lòng dùng file nhỏ hơn.",
    "generateFailed": "Không thể tạo nội dung bằng AI.",
    "youtubeLinkRequired": "Vui lòng nhập đường dẫn YouTube trước.",
    "fetchVideoDetailsSuccess": "Tải chi tiết video thành công!",
    "fetchVideoDetailsError": "Không thể tải chi tiết video này. Kiểm tra lại đường dẫn và khóa API của bạn.",
    "viralInfoAndTargetTitleRequired": "Vui lòng cung cấp bản ghi lời của video viral và tiêu đề mục tiêu.",
    "channelRequired": "Vui lòng chọn kênh mục tiêu trước khi chạy tự động hóa.",
    "stepError": "Đã xảy ra lỗi ở bước: {{stepName}}.",
    "stepError500": "Đã xảy ra lỗi nội bộ tạm thời ở bước: {{stepName}}. Vui lòng thử lại sau giây lát.",
    "stepRerunSuccess": "Chạy lại bước '{{stepName}}' thành công!",
    "chainCompleted": "Chuỗi tự động hóa đã hoàn tất!",
    "automationStopped": "Người dùng đã dừng tự động hóa.",
    "stoppingAutomation": "Đang dừng tự động hóa...",
    "automationStepsSaved": "Đã lưu các câu lệnh tự động hóa thành công.",
    "automationStepsSaveFailed": "Lưu các câu lệnh tự động hóa thất bại.",
    "srtRequired": "Vui lòng cung cấp nội dung SRT cho bước cuối cùng để tiếp tục.",
    "chainAlreadyCompleted": "Chuỗi tự động hóa đã hoàn thành.",
    "rerunDataLoaded": "Đã tải dữ liệu từ dự án '{{projectName}}' cho một lần chạy tự động hóa mới.",
    "resetChainSuccess": "Tiến trình của chuỗi đã được reset.",
    "resetInputsSuccess": "Tất cả dữ liệu đầu vào đã được xóa.",
    "dbConnectionError": "Không thể kết nối với cơ sở dữ liệu. Điều này có thể do sự cố mạng hoặc cấu hình dự án Firebase không chính xác (ví dụ: Firestore chưa được bật).",
    "copied": "Đã sao chép vào clipboard!",
    "step5AutoFilled": "Dữ liệu cho Bước 5 đã được điền tự động từ lựa chọn tốt nhất của Bước 4!",
    "projectExported": "Đã sao chép dữ liệu dự án!",
    "exportFailed": "Không thể sao chép dữ liệu.",
    "promptRestored": "Câu lệnh cho Bước {{id}} đã được khôi phục về mặc định.",
     "ideaAdded": "Đã thêm (các) ý tưởng thành công!",
    "ideaUpdated": "Đã cập nhật trạng thái ý tưởng.",
    "ideaDeleted": "Đã xóa ý tưởng.",
    "sharedChannelPermissionErrorAdmin": "Không thể tải các kênh được chia sẻ. Quy tắc bảo mật và/hoặc chỉ mục cơ sở dữ liệu Firestore của bạn có thể chưa được cập nhật cho các tính năng chia sẻ. Vui lòng vào Bảng điều khiển Admin -> Hướng dẫn Cài đặt và áp dụng cấu hình mới nhất.",
    "sharedChannelPermissionErrorUser": "Không thể tải các kênh được chia sẻ. Cấu hình bảo mật của ứng dụng có thể đã lỗi thời. Vui lòng liên hệ với quản trị viên của bạn để được hỗ trợ.",
    "missingIndexErrorAdmin": "Thiếu một chỉ mục cơ sở dữ liệu cần thiết cho việc chia sẻ. Ứng dụng sẽ không thể tìm thấy các kênh được chia sẻ cho đến khi chỉ mục này được tạo.",
    "missingIndexErrorUser": "Không thể tải các kênh được chia sẻ do sự cố cấu hình. Vui lòng liên hệ với quản trị viên của bạn.",
    "migrationError": "Không thể cập nhật dữ liệu kênh cũ. Một số kênh được chia sẻ có thể không hiển thị đúng. Vui lòng liên hệ hỗ trợ.",
    "generated": {
      "videoTitle": "Đã tạo tiêu đề video!",
      "description": "Đã tạo mô tả!",
      "tags": "Đã tạo thẻ!",
      "thumbnailPrompt": "Đã tạo prompt hình thu nhỏ!"
    },
    "deleteConfirm": "Xác nhận Xóa",
    "clearConfirm": "Xác nhận Xóa Form"
  }
}
