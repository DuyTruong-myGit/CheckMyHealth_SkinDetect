const { pool } = require('./db');

/**
 * Tạo bảng news_sources nếu chưa tồn tại
 * Được gọi tự động khi backend start
 */
const initializeDatabase = async () => {
  let connection;
  try {
    connection = await pool.getConnection();

    // Tạo bảng news_sources
    await connection.query(`
      CREATE TABLE IF NOT EXISTS news_sources (
        source_id INT AUTO_INCREMENT PRIMARY KEY,
        url VARCHAR(512) NOT NULL UNIQUE,
        label VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ news_sources table checked/created');

    // Kiểm tra bảng watch_measurements (bảng đã được tạo sẵn trong DB)
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
