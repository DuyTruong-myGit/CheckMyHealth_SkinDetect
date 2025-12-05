const { pool } = require('./db');

/**
 * Tạo bảng và cập nhật cấu trúc DB nếu thiếu
 * Được gọi tự động khi backend start
 */
const initializeDatabase = async () => {
  let connection;
  try {
    connection = await pool.getConnection();

    // 1. Tạo bảng news_sources (Giữ nguyên logic cũ)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS news_sources (
        source_id INT AUTO_INCREMENT PRIMARY KEY,
        url VARCHAR(512) NOT NULL UNIQUE,
        label VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ news_sources table checked/created');

    // 2. [QUAN TRỌNG] Kiểm tra và thêm cột fcm_token vào bảng users
    try {
      // Thử select cột fcm_token
      await connection.query('SELECT fcm_token FROM users LIMIT 1');
    } catch (err) {
      // Nếu lỗi là 1054 (Unknown column), tiến hành thêm cột
      if (err.errno === 1054) {
        console.log('⚠️ Cột fcm_token chưa tồn tại trong bảng users. Đang thêm mới...');
        await connection.query('ALTER TABLE users ADD COLUMN fcm_token VARCHAR(255) DEFAULT NULL');
        console.log('✅ Đã thêm cột fcm_token thành công!');
      } else {
        // Nếu là lỗi khác thì ném ra ngoài
        throw err;
      }
    }

    // 3. [MỚI - QUAN TRỌNG] Thêm cột last_triggered_at cho schedules
    // Đây là "chìa khóa" để chặn server gửi trùng lặp
    try {
        await connection.query('SELECT last_triggered_at FROM schedules LIMIT 1');
    } catch (err) {
        if (err.errno === 1054) { // Lỗi 1054: Unknown column
            console.log('⚠️ Đang thêm cột last_triggered_at để chặn spam thông báo...');
            await connection.query('ALTER TABLE schedules ADD COLUMN last_triggered_at DATETIME DEFAULT NULL');
            console.log('✅ Đã thêm cột last_triggered_at thành công!');
        }
    }

    // 3. Kiểm tra bảng watch_measurements (Giữ nguyên logic cũ)
    const [watchTableExists] = await connection.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'watch_measurements'
    `);
    
    if (watchTableExists[0].count > 0) {
      console.log('✅ watch_measurements table exists');
    } else {
      console.warn('⚠️ watch_measurements table not found - please create it manually');
    }

  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

module.exports = { initializeDatabase };