# GAME DESIGN DOCUMENT (GDD) - BẢN CẬP NHẬT
## Dự án: Top-Down 2D MOBA (5v5 PvP & 5 Players vs 5 AI Bots)

---

## 1. TỔNG QUAN & ĐỊNH HƯỚNG MỚI (PROJECT OVERVIEW)

- **Thể loại**: Top-Down 2D Tactical MOBA (Đấu trường chiến thuật 5v5).
- **Góc nhìn**: Top-Down nhìn thẳng từ trên xuống (Top-down 2D).
- **Phong cách thị giác (Visual Style)**:
  - **Tướng (Hero Token)**: Tối giản, trực quan và hiện đại:
    - **Lõi trung tâm (Inner Circle)**: Hình tròn hiển thị avatar/ảnh đại diện tướng (có mũi tên hoặc vạch chỉ hướng quay mặt/ngắm bắn).
    - **Vòng đo bên ngoài (Outer Rings / Arc Gauges)**:
      - **Vòng Máu (HP Bar)**: Vòng cung màu xanh lá (đồng minh) / đỏ (kẻ địch), tự động vơi dần khi nhận sát thương.
      - **Vòng Năng Lượng (Mana Bar)**: Vòng cung màu xanh dương, tiêu hao khi tung chiêu và tự động hồi phục.
      - Hiển thị cấp độ (Level) ở góc nhỏ của token.
- **Hai chế độ chơi trọng tâm**:
  1. **PvP (5v5 Người vs Người)**: Đấu trường 10 người chơi online, chia làm Đội Xanh (Blue Team) và Đội Đỏ (Red Team).
  2. **PvE (5 Người chơi vs 5 Bot AI)**: 5 người chơi lập đội chiến đấu với 5 tướng Bot AI có tư duy chiến thuật như người thật.

---

## 2. THIẾT KẾ ĐỒ HỌA TOKEN TƯỚNG (HERO TOKEN DESIGN)

```
                     [ Vòng Máu HP (Xanh lá / Đỏ) ]
                                 ▲
                          .---'''''''---.
                       .-'    _______    '-.
                     .'     /         \     '.
                    /      |   ẢNH     |      \
                   |  LVL  |  AVATAR   |  DIR  |  ==> Hướng nhìn (Facing Indicator)
                   |  (3)  |   TƯỚNG   |  ──>  |
                    \      |           |      /
                     '.     \ _______ /     .'
                       '-.               .-'
                          '---.......---'
                                 ▼
                    [ Vòng Năng lượng (Mana Xanh lam) ]
```

- **Bán kính Lõi**: ~28px - 32px (chứa ảnh đại diện bo tròn).
- **Độ dày vòng viền ngoài**: 4px - 6px.
  - Nửa trên (hoặc vòng ngoài): Hiển thị thanh Máu (HP / Max HP). Có hiệu ứng nhấp nháy đỏ khi sắp hết máu.
  - Nửa dưới (hoặc vòng phụ): Hiển thị thanh Mana (Mana / Max Mana).
- **Chỉ báo hướng (Direction Indicator)**: Một vạch nhỏ hoặc tam giác hướng về phía chuột/hướng di chuyển để người chơi nhận biết hướng xuất chiêu.

---

## 3. THIẾT KẾ TRÍ TUỆ NHÂN TẠO (AI BOT THINKING & BEHAVIOR)

Chế độ PvE yêu cầu 5 Bot AI có tư duy chiến thuật như người chơi thật (Human-like behavior). AI được xây dựng theo mô hình **Hierarchical State Machine (HFSM)** kết hợp **Utility AI**:

### 3.1. Phân chia vai trò & Đi đường (Laning Assignment)
- Bot 1: Đường Trên (Top Lane) - Thường là tướng Đấu Sĩ / Đỡ Đòn.
- Bot 2: Đường Giữa (Mid Lane) - Tướng Pháp Sư / Sát Thủ có khả năng đảo đường.
- Bot 3 & Bot 4: Đường Dưới (Bot Lane) - Xạ Thủ (ưu tiên farm) + Hỗ Trợ (bảo kê, cắm mắt, quấy rối).
- Bot 5: Đi Rừng (Jungler) - Farm bãi quái rừng, tìm cơ hội đi gank các đường khi đối thủ dâng cao.

### 3.2. Tư duy hành vi trong trận đấu (Behavioral Logic)
1. **Giai đoạn Đi Đường (Laning Phase)**:
   - **Giữ vị trí an toàn**: Đứng sau lính đồng minh để tránh đạn định hướng.
   - **Last-hit lính**: Canh lính địch còn thấp máu để đánh phát cuối lấy vàng.
   - **Cấu rỉa (Harass / Poke)**: Khi người chơi bước vào tầm đánh mà không có lính che, bot sẽ tung đòn đánh/kỹ năng rồi lùi lại ngay.
   - **Quản lý Máu & Mana**: Nếu máu dưới 30% và không an toàn, bot sẽ lùi sâu về sau trụ để Biến Về (Recall) hồi phục.
2. **Tư duy Giao tranh & Phối hợp (Combat & Gank)**:
   - **Đánh giá tương quan lực lượng**: Nếu số lượng quân địch > số lượng đồng minh trong bán kính 1500m -> Bot tự động lùi về trụ (Fall back).
   - **Tập trung hỏa lực (Focus Fire)**: Ưu tiên tấn công mục tiêu máu giấy nhất hoặc chủ lực (Xạ thủ/Pháp sư) của đối phương.
   - **Dồn sát thương (Combo Execution)**: Giữ kỹ năng khống chế (Stun/Slow) trước, sau đó tung các chiêu dồn sát thương tiếp nối.
   - **Phản ứng né chiêu**: Nhận diện Projectile (đạn bay) của người chơi và thực hiện né vuông góc với quỹ đạo đạn.
3. **Chiếm Mục Tiêu & Công Thành (Objective Play)**:
   - Đẩy trụ (Push Tower) khi đã hạ gục tướng trấn giữ đường.
   - Tập hợp 3-5 bot để ăn Rồng / Boss lớn khi phát hiện đội người chơi đang ở xa hoặc thiếu người.

---

## 4. BẢN ĐỒ KHỔNG LỒ & HỆ THỐNG CAMERA (MAP & CAMERA SYSTEM)

- **Kích thước Map**: **15.000 x 15.000 pixel (Đại bản đồ VUÔNG siêu khổng lồ tỷ lệ 1:1)**.
- **Tổng hợp tinh hoa địa hình từ 3 tựa game hàng đầu (LoL, Dota 2, Honor of Kings / AoV)**:
  - **Dòng Sông Chữ S Tự Nhiên (Realistic S-Curved River)**: Uốn cong chữ S mềm mại nối từ ngã ba đường Top `(2500, 1200)`, lượn quanh Hang Baron, cắt ngang tâm Mid tại `(7500, 7500)`, lượn quanh Hang Rồng và đổ ra ngã ba Bot `(13800, 12500)`.
  - **Địa hình Hai Phe Đối Nghịch (Verdant Radiant vs Volcanic Dire - Dota 2)**: Nửa dưới-trái là rừng xanh tươi tốt của Đội Xanh, nửa trên-phải là vùng đất nham thạch hắc ám của Đội Đỏ, tạo chiều sâu thị giác độc đáo.
  - **Hang Boss Chữ U Móng Ngựa & Hốc Đường (LoL Summoner's Rift)**:
    - Hang Baron Nashor `(4800, 4400)` mở miệng hướng xuống bờ sông phía Tây-Bắc.
    - Hang Rồng Nguyên Tố `(10200, 10600)` mở miệng hướng lên bờ sông phía Đông-Nam.
    - Hai Hốc Ven Đường (Alcoves) tại góc Top `(1200, 1200)` và Bot `(13100, 13100)`.
  - **Hệ thống 20 Trụ Phòng Thủ (10 Xanh vs 10 Đỏ - Phong cách Liên Quân / Honor of Kings)**:
    - 3 Tuyến đường x 3 Tầng Trụ (Trụ Ngoài T1, Trụ Trong T2, Trụ Nhà Lính T3).
    - **1 Trụ Nhà Chính Độc Nhất (Central Nexus Tower)** đứng sừng sững trấn giữ ngay trước nhà chính mỗi đội.
  - **12 Bãi Quái Rừng Đầy Đủ**:
    - 2 Boss Sông Huyền Thoại: Baron Nashor 👑 & Rồng Lửa 🐉.
    - 4 Cánh Rừng: Bùa Xanh 💧, Bùa Đỏ 🔥, Bầy Sói 🐺, Bãi Chim 🦅, Cóc Gromp 🐸 cho cả hai phe.
- **Kiến trúc mã nguồn (Modular Architecture)**:
  - Phân tách độc lập: `config/`, `core/`, `entities/`, `ai/`, `rendering/`, `ui/`.
  - Logic thực thể và AI độc lập với Canvas, sẵn sàng chuyển đổi sang Dedicated Server Multiplayer.
- **Hệ thống Điều khiển Camera & Phím [Y]**:
  - **Phím [Y]**: Bật/Tắt chế độ **Khóa Camera (Camera Lock)**:
    - **Khi BẬT (Locked)**: Camera luôn bám mượt mà theo tâm nhân vật của người chơi.
    - **Khi TẮT (Unlocked - Camera Tự Do)**:
      - **Edge Panning**: Rê chuột ra sát 4 mép màn hình (< 35px) để trượt camera soi các đường khác trên toàn bản đồ.
      - **Phím [Space]**: Giữ phím Space để tức thời kéo camera quay trở về tâm nhân vật.
- **Bản đồ nhỏ tương tác (Interactive Minimap)**:
  - Tọa lạc ở góc dưới bên phải màn hình (tỷ lệ chuẩn).
  - **Click chuột trái**: Dịch chuyển góc nhìn camera tức thì đến điểm đó trên map lớn.
  - **Click chuột phải**: Ra lệnh cho tướng di chuyển đến điểm chỉ định trên bản đồ.
  - Hiển thị chấm tướng (Xanh = bạn/đồng minh, Đỏ = địch) và khung chữ nhật đại diện góc nhìn hiện tại.

---

## 5. HỆ THỐNG LÍNH (MINIONS) & CƠ CHẾ HỒI SINH TRỤ 3 (INHIBITOR TOWERS)

### 5.1. Chu kỳ xuất hiện lính (Minion Wave Timing)
- **Đợt lính đầu tiên (First Wave)**: Xuất trận sau **1 phút (60 giây)** kể từ khi trận đấu bắt đầu (`⏱️ 01:00`).
- **Tần suất các đợt tiếp theo (Wave Interval)**: Xuất trận đều đặn sau mỗi **30 giây** (`01:30`, `02:00`, `02:30`,...).
- **Quy mô hành quân**: Xuất hiện đồng loạt tại tế đàn của cả 2 đội và hành quân trên cả **3 đường (Top, Mid, Bot)** theo lộ trình waypoints.

### 5.2. Các chủng loại lính (Minion Types)
1. **Lính Cận Chiến (Melee Minion - 🛡️)**:
   - Máu: 720 | Sát thương: 40 | Tầm đánh: 110 | Tốc đánh: 1.2s | Tốc độ chạy: 320.
   - Đi đầu đội hình, che chắn sát thương cho hàng sau.
2. **Lính Đánh Xa (Ranged Minion - 🔮)**:
   - Máu: 460 | Sát thương: 52 | Tầm bắn: 550 | Tốc đánh: 1.4s | Tốc độ chạy: 320.
   - Bắn phép từ xa, gây sát thương duy trì ổn định.
3. **Lính Xe Pháo (Cannon Minion - 💣)**:
   - Máu: 1350 | Sát thương: 85 | Tầm bắn: 650 | Tốc đánh: 1.8s | Tốc độ chạy: 300.
   - Giảm **30% sát thương nhận từ trụ phòng thủ**, công trụ cực mạnh.
4. **Lính Siêu Cấp (Super Minion - 🤖)**:
   - Máu: 3800 | Sát thương: 190 | Tầm đánh: 130 | Tốc đánh: 1.0s | Tốc độ chạy: 340.
   - Thân hình khổng lồ, viền vàng cam phát sáng, chỉ số vượt trội giúp đẩy đường áp đảo.

### 5.3. Cơ chế Lính Siêu Cấp & Hồi sinh Trụ 3 (Inhibitor Tower Respawn)
- **Kích hoạt Lính Siêu Cấp theo đường**: Khi Trụ 3 (Trụ Nhà Lính) của đối phương trên một đường bị phá hủy, đội đối diện sẽ được sinh ra **+1 Lính Siêu Cấp** trên đường đó trong mỗi đợt lính.
- **Cơ chế Hồi Sinh Trụ 3 (Respawn Mechanics)**:
  - Sau khi Trụ 3 bị phá hủy, vị trí trụ biến thành **Tàn Tích (Ruins)** kèm bộ đếm ngược **5 phút (300 giây)** hiển thị trực quan: `✨ Hồi sinh: mm:ss (50% Máu)`.
  - Hết 300 giây, Trụ 3 sẽ **tự động hồi sinh với đúng 50% lượng máu tối đa**.
  - Ngay khi Trụ 3 hồi sinh, đối phương sẽ **ngừng sinh lính siêu cấp** trên đường đó (trừ khi trụ 3 lại bị phá vỡ lần nữa).
- **Thưởng Phá Hủy Cả 3 Trụ Trong (All 3 Inhibitors Down Bonus)**:
  - Nếu toàn bộ cả 3 Trụ 3 (Top, Mid, Bot) của một đội cùng lúc bị sập, đối phương sẽ nhận được bùa lợi **Siêu Công Thành**: Mỗi đợt lính trên **cả 3 đường sẽ xuất hiện thêm 1 Lính Siêu Cấp nữa** (tổng cộng 2 Lính Siêu Cấp mỗi đường một đợt).

---

## 6. CƠ CHẾ TẦM NHÌN (FOG OF WAR) & ĐÁNH THƯỜNG TỰ ĐỘNG KHÓA MỤC TIÊU (HOMING ATTACKS)

### 6.1. Cơ Chế Tầm Nhìn & Sương Mù Chiến Tranh (Fog of War)
- **Nguồn Cung Cấp Tầm Nhìn Phe Ta (Allied Vision Sources)**:
  - Tế Đàn / Nhà Chính Xanh: Bán kính **1200 px**.
  - Người chơi (Player): Bán kính **950 px**.
  - Tướng đồng minh: Bán kính **900 px**.
  - Trụ phòng thủ phe ta: Bán kính **950 px**.
  - Lính đồng minh: Bán kính **650 px**.
- **Tính Chất Động (Dynamic Lifecycle)**:
  - Tầm nhìn di chuyển liên tục theo vị trí thực của tướng và lính đồng minh.
  - Khi một đơn vị đồng minh bị tiêu diệt hoặc trụ sập, vòng tầm nhìn tại vị trí đó **biến mất ngay lập tức** và khu vực bị sương mù che phủ lại.
- **Ẩn / Hiện Thực Thể (Entity Visibility)**:
  - **Tướng địch, lính địch, quái rừng** khi nằm ngoài tầm nhìn phe ta sẽ bị ẩn hoàn toàn (không render trên màn hình chính và không hiện chấm trên Minimap).
  - **Cơ chế Bụi Cỏ (Bushes)**: Kẻ địch nấp trong bụi cỏ chỉ bị phát hiện khi có đồng minh cùng bước vào bụi cỏ đó hoặc ở cự ly cận chiến ($\le 120\text{px}$).
- **Hiệu Ứng Thị Giác Sương Mù**:
  - Lớp sương mù tối phủ lên toàn bộ địa hình với viền chuyển tiếp mềm mại (Radial Gradient Cutout) quanh các nguồn sáng đồng minh trên cả màn hình chính và Minimap.

### 6.2. Cơ Chế Đánh Thường Tự Động Khóa Mục Tiêu (Homing Basic Attacks)
- **Đạn Lượn Bám Đuổi (Homing Projectile Physics)**:
  - Đạn đánh thường của trụ, lính và tướng tự động khóa mục tiêu và uốn lượn bay theo mục tiêu đang di chuyển, đảm bảo trúng đích chính xác 100%.
  - Đạn bay xuyên qua các bờ tường địa hình để tấn công mục tiêu đã khóa.
  - Nếu mục tiêu bị tiêu diệt trước khi đạn chạm tới, viên đạn tự động tiêu biến.
- **Đánh Thường Của Trụ**: Đạn laser phòng thủ tốc độ **1100 px/s**, tự động bám đuổi theo lính hoặc tướng địch.
- **Đánh Thường Của Lính Đánh Xa & Pháo**: Đạn phép (🔮) và đạn pháo (💣) tốc độ **750 px/s**, tự động bay vào mục tiêu.
- **Đánh Thường Của Người Chơi (Smart Right-Click MOBA)**:
  - Click chuột phải vào kẻ địch (Tướng địch, lính địch, trụ địch, quái rừng): Khóa mục tiêu, hiện **Vòng Ngắm Màu Đỏ (Target Reticle)** dưới chân mục tiêu. Tự động di chuyển vào tầm đánh (**550 px**) và khai hỏa đạn đánh thường homing tốc độ **950 px/s** (sát thương 85, hồi chiêu 0.9s).
  - Click chuột phải vào mặt đất: Hủy khóa mục tiêu và di chuyển bình thường.

---

## 7. HỆ THỐNG TIẾN TRÌNH: CẤP ĐỘ, TIỀN THƯỞNG & NÂNG CẤP KỸ NĂNG (PROGRESSION & ECONOMY)

### 7.1. Cơ Chế Cấp Độ (Level & EXP System)
- **Giới hạn cấp độ**: Khởi đầu tại **Cấp độ 1**, cấp tối đa là **Cấp độ 15** (`MAX_LEVEL = 15`).
- **Đường cong EXP (EXP Scaling Curve)**: Càng lên cao, lượng EXP yêu cầu để thăng cấp càng tăng dần:
  - Cấp 1 $\to$ 2: `240 EXP`
  - Cấp 2 $\to$ 3: `360 EXP`
  - Cấp 3 $\to$ 4: `500 EXP`
  - Cấp 4 $\to$ 5: `660 EXP`
  - Cấp 5 $\to$ 6: `840 EXP`
  - Cấp 6 $\to$ 7: `1040 EXP`
  - Cấp 7 $\to$ 8: `1260 EXP`
  - Cấp 8 $\to$ 9: `1500 EXP`
  - Cấp 9 $\to$ 10: `1760 EXP`
  - Cấp 10 $\to$ 11: `2040 EXP`
  - Cấp 11 $\to$ 12: `2340 EXP`
  - Cấp 12 $\to$ 13: `2660 EXP`
  - Cấp 13 $\to$ 14: `3000 EXP`
  - Cấp 14 $\to$ 15: `3400 EXP`
- **Tăng chỉ số cơ bản mỗi cấp (Stat Growth per Level)**:
  - **Máu tối đa (Max HP)**: $+90$ (hồi phục ngay $+90$ HP hiện tại).
  - **Năng lượng tối đa (Max Mana)**: $+45$ (hồi phục ngay $+45$ Mana hiện tại).
  - **Sát thương đánh thường (Attack Damage)**: $+5$.
  - **Tốc độ hồi Máu (HP Regen)**: $+1.0\text{ HP/s}$.
  - **Tốc độ hồi Mana (Mana Regen)**: $+1.2\text{ Mana/s}$.
- **Huy hiệu cấp độ (Level Badge)**: Hiển thị vòng tròn số cấp độ ngay trên token nhân vật và thanh HUD phía dưới.

### 7.2. Cơ Chế Tiền Thưởng & Kinh Tế (Gold Economy & Bounties)
- **Khởi đầu trận đấu**: Mỗi tướng bắt đầu với **500 Vàng** (`INITIAL_GOLD = 500`).
- **Thu nhập thụ động (Passive Gold Income)**:
  - Nhận đều đặn **$+3$ Vàng mỗi giây** (`PASSIVE_GOLD_PER_SEC = 3`) cho tất cả tướng còn sống trên bản đồ.
- **Bảng tiền thưởng & EXP khi hạ gục mục tiêu (Bounties Table)**:
  - **Lính Cận Chiến (Melee)**: $+60\text{ EXP}$, $+25\text{ Vàng}$.
  - **Lính Đánh Xa (Ranged)**: $+45\text{ EXP}$, $+20\text{ Vàng}$.
  - **Lính Xe Pháo (Cannon)**: $+95\text{ EXP}$, $+45\text{ Vàng}$.
  - **Lính Siêu Cấp (Super Minion)**: $+150\text{ EXP}$, $+70\text{ Vàng}$.
  - **Quái Rừng Thường (Sói, Chim, Cóc)**: $+140\text{ EXP}$, $+55\text{ Vàng}$.
  - **Quái Bùa Rừng (Bùa Xanh, Bùa Đỏ)**: $+240\text{ EXP}$, $+100\text{ Vàng}$.
  - **Rồng Lửa (Dragon Boss)**: $+650\text{ EXP}$, $+250\text{ Vàng}$ cho người dứt điểm + **$+300\text{ EXP}$, $+150\text{ Vàng}$ toàn đội**.
  - **Baron Nashor (Baron Boss)**: $+1000\text{ EXP}$, $+400\text{ Vàng}$ cho người dứt điểm + **$+500\text{ EXP}$, $+250\text{ Vàng}$ toàn đội**.
  - **Hạ gục Tướng Địch (Hero Kill)**: $+350\text{ EXP}$, $+300\text{ Vàng}$ cho người hạ gục. Tướng đồng minh tham gia hỗ trợ trong bán kính $1000\text{px}$ nhận $+150\text{ EXP}$, $+150\text{ Vàng}$.
  - **Phá Hủy Trụ Phòng Thủ (Tower Destroy)**: $+250\text{ Vàng}$ cho người dứt điểm + **$+150\text{ EXP}$, $+100\text{ Vàng}$ toàn đội**.
- **Cơ chế chia sẻ EXP/Vàng hỗ trợ (Assist Radius)**: Tướng đồng minh trong bán kính **$1000\text{px}$** quanh mục tiêu bị tiêu diệt đều nhận được phần thưởng hỗ trợ tương ứng.

### 7.3. Cơ Chế Thăng Cấp Kỹ Năng (Skill Leveling System)
- **Điểm kỹ năng (Skill Points)**:
  - Bắt đầu trận với **1 Điểm kỹ năng**.
  - Mỗi lần thăng cấp độ nhân vật (từ 2 đến 15) thưởng thêm **$+1$ Điểm kỹ năng** (tổng cộng 15 điểm qua 15 cấp).
- **Mở khóa & Cường hóa chiêu thức (Q, W, E, R)**:
  - Ban đầu cả 4 chiêu thức đều ở trạng thái **Khóa (🔒 Locked)**.
  - Người chơi sử dụng Điểm kỹ năng để mở khóa hoặc nâng cấp chiêu:
    - Nhấp nút `[+]` màu xanh vàng phát sáng nổi bật trên ô chiêu.
    - Hoặc phím tắt nhanh: `Ctrl + Q`, `Ctrl + W`, `Ctrl + E`, `Ctrl + R`.
  - **Hàng Pips (Đèn báo cấp chiêu)**: 4 chấm sáng tròn dưới mỗi chiêu Q, W, E (3 chấm với R) hiển thị cấp độ hiện tại của chiêu.
- **Bảng chỉ số nâng cấp chiêu**:
  - **Chiêu [Q] - Đạn Năng Lượng (Skillshot)** (Cấp tối đa 4):
    - Cấp 1 $\to$ 4: Sát thương `160 / 220 / 280 / 340`, Hồi chiêu `4.5 / 4.0 / 3.5 / 3.0s`, Mana `50 / 55 / 60 / 65`, Tốc độ bay `1100 / 1150 / 1200 / 1250 px/s`, Tầm bắn `900 / 950 / 1000 / 1050 px`.
  - **Chiêu [W] - Hộ Thể (Shield & Haste)** (Cấp tối đa 4):
    - Cấp 1 $\to$ 4: Lá chắn `220 / 320 / 420 / 520 HP`, Tăng tốc `+25% / +30% / +35% / +40%`, Thời gian hiệu lực `3.0 / 3.5 / 4.0 / 4.5s`, Hồi chiêu `8.0 / 7.2 / 6.4 / 5.6s`.
  - **Chiêu [E] - Tốc Biến (Tactical Dash)** (Cấp tối đa 4):
    - Cấp 1 $\to$ 4: Cự ly lướt `420 / 470 / 520 / 570 px`, Hồi chiêu `9.0 / 8.0 / 7.0 / 6.0s`, Mana `60 / 55 / 50 / 45`.
  - **Chiêu [R] - Thiên Phạt (Ultimate AoE)** (Cấp tối đa 3):
    - **Yêu cầu cấp độ tướng**: Cấp 1 mở tại Lv 4; Cấp 2 mở tại Lv 8; Cấp 3 mở tại Lv 12.
    - Sát thương nổ diện rộng: `350 / 520 / 700`, Bán kính nổ: `400 / 450 / 500 px`, Hồi chiêu: `45 / 38 / 30s`.
  - **Chiêu [B] - Biến Về (Recall)**: Sẵn sàng từ đầu trận, niệm 4.0 giây không bị ngắt quãng để biến về Tế Đàn hồi đầy Máu & Mana.

---

## 8. KIẾN TRÚC CLIENT - SERVER CHO 5V5

```
           ┌────────────────────────────────────────┐
           │        AUTHORITATIVE GAME SERVER       │
           │  - 30-60 Ticks / Giây                  │
           │  - Chạy mô phỏng vật lý & va chạm 2D   │
           │  - Module Bot AI (chạy thẳng ở Server) │
           │  - Đồng bộ trạng thái (State Broadcast)│
           └───────────────────┬────────────────────┘
                               │ WebSocket / WebRTC
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
   [CLIENT TEAM XANH]                    [CLIENT TEAM ĐỎ]
   - Vẽ Canvas 2D / WebGL                - Vẽ Canvas 2D / WebGL
   - Token Tướng (Ảnh tròn + Viền HP/MP) - Token Tướng (Ảnh tròn + Viền HP/MP)
   - Nhận click chuột & gửi input        - Nhận click chuột & gửi input
   - Client Prediction cho mượt mà       - Client Prediction cho mượt mà
```

---

## 9. KẾ HOẠCH HÀNH ĐỘNG TIẾP THEO

1. **Kiểm thử trải nghiệm tiến trình (Progression Balance Testing)**:
   - Thử nghiệm độ mượt khi farm lính, ăn bùa rừng và giao tranh nâng chiêu.
   - Cân bằng giá trị vàng thu nhập thụ động và thưởng hạ gục.
2. **Hệ thống Cửa Hàng & Trang Bị (Item Shop)**:
   - Sử dụng số vàng tích lũy được để mua sắm trang bị tăng sức mạnh (Kiếm Công, Trượng Phép, Giáp Máu, Giày Tốc Độ,...).
3. **Mạng Đa Người Chơi (Multiplayer Networking)**:
   - Nâng cấp module Game State sang WebSocket Server chạy 5v5 PvP thời gian thực.
