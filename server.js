const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어
// CORS 설정 - 모든 origin 허용 (개발 환경)
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname)));

// PostgreSQL 데이터베이스 연결
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// 데이터베이스 연결 테스트 및 초기화
pool.connect((err, client, release) => {
    if (err) {
        console.error('데이터베이스 연결 실패:', err.message);
    } else {
        console.log('데이터베이스 연결 성공');
        release();
        initDatabase();
    }
});

// 데이터베이스 테이블 생성
async function initDatabase() {
    const client = await pool.connect();
    try {
        // 발급목록 테이블
        await client.query(`
            CREATE TABLE IF NOT EXISTS issued_coupons (
                id SERIAL PRIMARY KEY,
                date TEXT NOT NULL,
                worker TEXT NOT NULL,
                content TEXT NOT NULL,
                amount TEXT NOT NULL,
                issuer TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 수행목록 테이블
        await client.query(`
            CREATE TABLE IF NOT EXISTS completed_coupons (
                id SERIAL PRIMARY KEY,
                issued_id INTEGER,
                date TEXT NOT NULL,
                performer TEXT,
                content TEXT NOT NULL,
                amount TEXT NOT NULL,
                photo TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (issued_id) REFERENCES issued_coupons(id) ON DELETE CASCADE
            )
        `);

        // 방명록 테이블
        await client.query(`
            CREATE TABLE IF NOT EXISTS guestbook (
                id SERIAL PRIMARY KEY,
                message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 초기 데이터 삽입 (테이블이 비어있을 때만)
        const issuedCount = await client.query("SELECT COUNT(*) as count FROM issued_coupons");
        if (parseInt(issuedCount.rows[0].count) === 0) {
            await client.query(`
                INSERT INTO issued_coupons (date, worker, content, amount, issuer) VALUES 
                ('25.11.15.', '유다연', '웹디자인', '3시금(1시간 30분)', '박중현'),
                ('25.11.07.', '이동식', '퍼포먼스촬영', '5시금', '타이')
            `);
        }

        const completedCount = await client.query("SELECT COUNT(*) as count FROM completed_coupons");
        if (parseInt(completedCount.rows[0].count) === 0) {
            await client.query(`
                INSERT INTO completed_coupons (issued_id, date, performer, content, amount) VALUES 
                (1, '25.12.10.', '정지윤', '카레만들기', '3시금(1시간 30분)')
            `);
        }
    } catch (err) {
        console.error('데이터베이스 초기화 오류:', err);
    } finally {
        client.release();
    }
}

// API 라우트

// 발급목록 조회 (발급일자 오래된 순으로 정렬)
app.get('/api/coupons/issued', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM issued_coupons ORDER BY date ASC, created_at ASC");
        res.json(result.rows.map((row, index) => ({
            ...row,
            order: index + 1
        })));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 수행목록 조회
app.get('/api/coupons/completed', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM completed_coupons ORDER BY id");
        res.json(result.rows.map((row, index) => ({
            ...row,
            order: index + 1
        })));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 발급목록 추가
app.post('/api/coupons/issued', async (req, res) => {
    const { date, worker, content, amount, issuer } = req.body;
    
    if (!date || !worker || !content || !amount) {
        res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
        return;
    }

    try {
        const result = await pool.query(
            "INSERT INTO issued_coupons (date, worker, content, amount, issuer) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [date, worker, content, amount, issuer || null]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 수행목록 추가
app.post('/api/coupons/completed', async (req, res) => {
    const { date, performer, content, amount, issued_id, photo } = req.body;
    
    if (!date || !content || !amount || !issued_id) {
        res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
        return;
    }

    try {
        const result = await pool.query(
            "INSERT INTO completed_coupons (issued_id, date, performer, content, amount, photo) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [issued_id, date, performer || null, content, amount, photo || null]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 발급목록 조회 (단일)
app.get('/api/coupons/issued/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const result = await pool.query("SELECT * FROM issued_coupons WHERE id = $1", [id]);
        if (result.rows.length === 0) {
            res.status(404).json({ error: '쿠폰을 찾을 수 없습니다.' });
            return;
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 수행목록 조회 (단일)
app.get('/api/coupons/completed/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const result = await pool.query("SELECT * FROM completed_coupons WHERE id = $1", [id]);
        if (result.rows.length === 0) {
            res.status(404).json({ error: '쿠폰을 찾을 수 없습니다.' });
            return;
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 발급목록 수정
app.put('/api/coupons/issued/:id', async (req, res) => {
    const id = req.params.id;
    const { date, worker, content, amount, issuer } = req.body;
    
    if (!date || !worker || !content || !amount) {
        res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
        return;
    }

    try {
        const result = await pool.query(
            "UPDATE issued_coupons SET date = $1, worker = $2, content = $3, amount = $4, issuer = $5 WHERE id = $6 RETURNING *",
            [date, worker, content, amount, issuer || null, id]
        );
        if (result.rows.length === 0) {
            res.status(404).json({ error: '쿠폰을 찾을 수 없습니다.' });
            return;
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 수행목록 수정
app.put('/api/coupons/completed/:id', async (req, res) => {
    const id = req.params.id;
    const { date, performer, content, amount, issued_id, photo } = req.body;
    
    if (!date || !content || !amount) {
        res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
        return;
    }

    try {
        const result = await pool.query(
            "UPDATE completed_coupons SET date = $1, performer = $2, content = $3, amount = $4, issued_id = $5, photo = $6 WHERE id = $7 RETURNING *",
            [date, performer || null, content, amount, issued_id || null, photo || null, id]
        );
        if (result.rows.length === 0) {
            res.status(404).json({ error: '쿠폰을 찾을 수 없습니다.' });
            return;
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 발급목록 삭제
app.delete('/api/coupons/issued/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const result = await pool.query("DELETE FROM issued_coupons WHERE id = $1", [id]);
        if (result.rowCount === 0) {
            res.status(404).json({ error: '쿠폰을 찾을 수 없습니다.' });
            return;
        }
        res.json({ message: '쿠폰이 삭제되었습니다.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 수행목록 삭제
app.delete('/api/coupons/completed/:id', async (req, res) => {
    const id = req.params.id;
    
    try {
        // 먼저 삭제할 수행 쿠폰의 issued_id 확인
        const completedResult = await pool.query("SELECT issued_id FROM completed_coupons WHERE id = $1", [id]);
        if (completedResult.rows.length === 0) {
            res.status(404).json({ error: '쿠폰을 찾을 수 없습니다.' });
            return;
        }
        
        const issuedId = completedResult.rows[0].issued_id;
        
        // 해당 issued_id를 가진 수행 쿠폰 개수 확인
        const countResult = await pool.query("SELECT COUNT(*) as count FROM completed_coupons WHERE issued_id = $1", [issuedId]);
        const completedCount = parseInt(countResult.rows[0].count);
        
        // 수행 쿠폰 삭제
        const deleteResult = await pool.query("DELETE FROM completed_coupons WHERE id = $1", [id]);
        if (deleteResult.rowCount === 0) {
            res.status(404).json({ error: '쿠폰을 찾을 수 없습니다.' });
            return;
        }
        
        // 수행 쿠폰이 1개였던 경우 (삭제 후 0개가 됨), 발급 쿠폰도 삭제
        if (completedCount === 1) {
            await pool.query("DELETE FROM issued_coupons WHERE id = $1", [issuedId]);
            res.json({ 
                message: '쿠폰이 삭제되었습니다.',
                deletedIssuedId: issuedId,
                reorder: true
            });
        } else {
            // 수행 쿠폰이 2개 이상이었던 경우, 수행 쿠폰만 삭제
            res.json({ message: '쿠폰이 삭제되었습니다.' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 방명록 API

// 방명록 조회
app.get('/api/guestbook', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM guestbook ORDER BY created_at ASC");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 방명록 추가
app.post('/api/guestbook', async (req, res) => {
    const { message } = req.body;
    
    console.log('방명록 추가 요청:', { message });
    
    if (!message || !message.trim()) {
        console.error('방명록 추가 실패: 메시지가 없음');
        res.status(400).json({ error: '메시지가 필요합니다.' });
        return;
    }
    
    try {
        const result = await pool.query("INSERT INTO guestbook (message) VALUES ($1) RETURNING *", [message.trim()]);
        console.log('방명록 추가 성공:', { id: result.rows[0].id, message: message.trim() });
        res.json({ id: result.rows[0].id, message: message.trim(), created_at: result.rows[0].created_at });
    } catch (err) {
        console.error('방명록 추가 데이터베이스 오류:', err);
        res.status(500).json({ error: `데이터베이스 오류: ${err.message}` });
    }
});

// 테스트 메시지 삭제 (새로고침 시 호출)
app.delete('/api/guestbook/test', async (req, res) => {
    try {
        await pool.query("DELETE FROM guestbook WHERE message LIKE '테스트%'");
        res.json({ message: '테스트 메시지가 삭제되었습니다.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 방명록 전체 삭제
app.delete('/api/guestbook/all', async (req, res) => {
    try {
        await pool.query("DELETE FROM guestbook");
        console.log('방명록 전체 삭제 성공');
        res.json({ message: '모든 방명록이 삭제되었습니다.' });
    } catch (err) {
        console.error('방명록 전체 삭제 실패:', err);
        res.status(500).json({ error: err.message });
    }
});

// 모든 경로에 대해 index.html 서빙 (SPA 라우팅 지원)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 서버 시작 (0.0.0.0으로 바인딩하여 모든 네트워크 인터페이스에서 접근 가능)
app.listen(PORT, '0.0.0.0', () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
    console.log(`다른 기기에서 접근: http://[서버IP]:${PORT}`);
});

// 프로세스 종료 시 데이터베이스 연결 종료
process.on('SIGINT', async () => {
    await pool.end();
    console.log('데이터베이스 연결이 종료되었습니다.');
    process.exit(0);
});

