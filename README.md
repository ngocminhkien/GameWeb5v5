# ⚔️ Top-Down 2D MOBA 5v5 (Web Canvas Game)

Dự án game chiến thuật trực tuyến **Top-Down 2D MOBA** (5v5 PvP & PvE Co-op vs 5 Bot AI) chạy trực tiếp trên nền tảng Web Canvas HTML5 / JavaScript, được xây dựng theo kiến trúc **Lập trình Hướng Đối Tượng (OOP)** chuẩn mực.

---

## 🌟 Tính Năng Nổi Bật

### 1. Đại Bản Đồ Chiến Thuật Vuông 15,000 x 15,000 px
- **Tỷ lệ 1:1 vuông vức hoàn hảo** kết hợp tinh hoa địa hình từ 3 tựa game MOBA hàng đầu:
  - **League of Legends (LoL)**: Hang Baron Nashor 👑 & Hang Rồng Lửa 🐉 hình chữ U, hốc đường (Alcoves) tại Top & Bot, bụi cỏ ba ngã (Tri-bushes).
  - **Dota 2**: Nền đất hai phe đối nghịch (Verdant Radiant màu xanh lục tươi tốt vs Volcanic Dire nham thạch hắc ám).
  - **Arena of Valor / Vương Giả Vinh Diệu**: Dòng sông chữ S uốn cong tự nhiên nối từ Top qua Mid xuống Bot, 4 cánh rừng với 12 bãi quái đầy đủ.

### 2. Hệ Thống 20 Trụ Phòng Thủ & Hồi Sinh Trụ 3
- 20 Trụ phòng thủ (10 Xanh vs 10 Đỏ) bố trí đẩy cao về phía sông bảo vệ tiền tuyến.
- **Duy nhất 1 Trụ Nhà Chính (Nexus Tower)** uy nghi trấn giữ trước tế đàn mỗi đội.
- **Cơ chế Hồi Sinh Trụ 3 (Inhibitor Tower)**: Trụ 3 sau khi bị phá hủy sẽ hóa thành tàn tích và đếm ngược **5 phút (300s)** để hồi sinh lại với **50% lượng máu ban đầu**.

### 3. Hệ Thống Đợt Lính (Minions) 3 Đường
- Đợt lính đầu tiên xuất trận sau **1 phút (60s)**, các đợt tiếp theo xuất trận định kỳ sau mỗi **30s**.
- 4 chủng loại lính:
  - **Lính Cận Chiến (Melee 🛡️)**: Máu trâu, đi đầu đỡ đòn.
  - **Lính Đánh Xa (Ranged 🔮)**: Bắn cầu ma thuật duy trì hỏa lực.
  - **Lính Xe Pháo (Cannon 💣)**: Công thành từ xa, giảm **30% sát thương từ trụ**.
  - **Lính Siêu Cấp (Super Minion 🤖)**: Xuất hiện khi Trụ 3 đối phương bị phá hủy (xuất hiện thêm lính siêu cấp nếu cả 3 đường đều mất Trụ 3).

### 4. Tầm Nhìn Chiến Thuật (Fog of War) & Đánh Thường Tự Khóa (Homing Attacks)
- **Sương mù chiến tranh động**: Cung cấp tầm nhìn từ Tế đàn, Tướng, Trụ và Lính đồng minh; tự động che giấu kẻ địch và quái rừng ngoài tầm nhìn.
- **Cơ chế Bụi Cỏ (Bushes)**: Ẩn nấp tàng hình phục kích.
- **Đánh thường thông minh MOBA**: Click chuột phải vào kẻ địch để hiện vòng ngắm đỏ, tự động di chuyển vào tầm bắn 550px và phóng đạn tự dẫn (homing) bám đuổi trúng đích 100%.

### 5. Hệ Thống Tiến Trình: Cấp Độ, Tiền Thưởng & Nâng Kỹ Năng
- **Cấp độ (Level 1 - 15)**: Yêu cầu EXP tăng dần theo từng cấp (240 EXP $\to$ 3400 EXP). Mỗi cấp tăng Max HP (+90), Max Mana (+45), Sát thương (+5), Hồi máu/mana.
- **Kinh tế & Tiền thưởng (Gold Economy)**: Khởi đầu với 500 Vàng, thu nhập thụ động **+3 Vàng/giây**, tiền thưởng & EXP khi hạ gục lính, quái, boss, tướng và trụ.
- **Nâng cấp kỹ năng (Q, W, E, R)**:
  - Khởi đầu với 1 điểm kỹ năng, mỗi cấp độ nhận thêm +1 điểm.
  - Phím tắt `Ctrl + Q / W / E / R` hoặc click nút `[+]` phát sáng.
  - Đèn báo cấp chiêu (Rank Pips) hiển thị trực quan.
  - Chiêu cuối **Thiên Phạt [R]** mở khóa tại cấp độ 4, 8, 12.

---

## 🏗️ Kiến Trúc Mã Nguồn (OOP Architecture)

Toàn bộ dự án được thiết kế theo mô hình **Hướng Đối Tượng (OOP)** phân tách thành các module sạch đẹp:

```
c:\GAME/
├── index.html                   # Bản Modular ES Module
├── main.js                      # Entry point bootstrap game
├── src/                         # Module source code
│   ├── config/                  # Constants, Terrain, Towers, Monsters
│   ├── entities/                # Entity (Base), Hero, Tower, Minion, Monster, Projectile
│   ├── rendering/               # Renderer, FogOfWar, Minimap
│   ├── core/                    # Game Engine, Camera, Input
│   ├── ui/                      # HUD Controller
│   └── ai/                      # BotAI State Machine
├── prototype/                   # Bản Prototype Zero-Dependency (Chạy trực tiếp file:///)
│   ├── index.html               # File HTML gọn gàng (~160 dòng)
│   ├── css/style.css            # Stylesheet giao diện
│   └── js/                      # Các OOP Classes nạp độc lập
└── docs/
    └── GDD.md                   # Game Design Document chi tiết
```

---

## 🚀 Hướng Dẫn Trải Nghiệm & Cài Đặt

### Cách 1: Chơi Ngay Lập Tức (Không cần cài đặt bất kỳ server nào)
Nhấp đúp chuột vào file:
```
prototype/index.html
```
Hoặc mở trên trình duyệt:
```
file:///c:/GAME/prototype/index.html
```

### Cách 2: Chạy Bản Modular ES Module
Sử dụng bất kỳ Web Server nào (Live Server, http-server, serve, Python HTTP server):
```bash
# Sử dụng Python có sẵn:
python -m http.server 8080

# Sau đó mở trình duyệt:
http://localhost:8080/index.html
```

---

## 🎮 Phím Tắt Điều Khiển

| Phím / Thao tác | Chức năng |
| :--- | :--- |
| **Chuột Phải** | Di chuyển / Khóa mục tiêu đánh thường (Tướng, Lính, Trụ, Quái) |
| **Chuột Trái / [Q]** | Bắn chiêu [Q] - Đạn Năng Lượng theo hướng trỏ chuột |
| **Phím [W]** | Kích hoạt [W] - Hộ Thể (Lá chắn & Tăng tốc chạy) |
| **Phím [E]** | Kích hoạt [E] - Tốc Biến (Lướt vượt địa hình) |
| **Phím [R]** | Kích hoạt [R] - Thiên Phạt (Sát thương nổ diện rộng AoE) |
| **Phím [B]** | Niệm 4 giây Biến Về Tế Đàn hồi phục |
| **Ctrl + Q/W/E/R** | Nâng cấp chiêu thức nhanh khi có điểm kỹ năng |
| **Phím [Y]** | Bật / Tắt Khóa Camera theo nhân vật |
| **Phím [Space]** | Giữ Space để kéo nhanh Camera về tâm nhân vật |
| **Cuộn Chuột** | Phóng to / Thu nhỏ góc nhìn (Zoom 0.4x - 1.5x) |
| **Rê chuột mép màn hình** | Trượt góc nhìn tự do (Edge Panning khi tắt khóa camera) |
| **Click Minimap** | Click trái để soi góc nhìn / Click phải để điều khiển tướng |

---

## 👨‍💻 Tác giả
- **GitHub**: [@ngocminhkien](https://github.com/ngocminhkien)
- **Repository**: [GameWeb5v5](https://github.com/ngocminhkien/GameWeb5v5.git)
