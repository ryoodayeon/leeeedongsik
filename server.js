const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
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

// 데이터베이스 초기화
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('데이터베이스 연결 실패:', err.message);
    } else {
        console.log('데이터베이스 연결 성공');
        initDatabase();
    }
});

// 데이터베이스 테이블 생성
function initDatabase() {
    // 발급목록 테이블
    db.run(`CREATE TABLE IF NOT EXISTS issued_coupons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        worker TEXT NOT NULL,
        content TEXT NOT NULL,
        amount TEXT NOT NULL,
        issuer TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 수행목록 테이블
    db.run(`CREATE TABLE IF NOT EXISTS completed_coupons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        issued_id INTEGER,
        date TEXT NOT NULL,
        performer TEXT,
        content TEXT NOT NULL,
        amount TEXT NOT NULL,
        photo TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (issued_id) REFERENCES issued_coupons(id)
    )`);

    // 방명록 테이블
    db.run(`CREATE TABLE IF NOT EXISTS guestbook (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 초기 데이터 삽입 (테이블이 비어있을 때만)
    db.get("SELECT COUNT(*) as count FROM issued_coupons", (err, row) => {
        if (err) {
            console.error('발급목록 카운트 조회 실패:', err);
            return;
        }
        if (row && row.count === 0) {
            db.run(`INSERT INTO issued_coupons (date, worker, content, amount, issuer) VALUES 
                ('25.11.15.', '유다연', '웹디자인', '3시금(1시간 30분)', '박중현'),
                ('25.11.07.', '이동식', '퍼포먼스촬영', '5시금', '타이')`, (err) => {
                if (err) {
                    console.error('초기 데이터 삽입 실패:', err);
                }
            });
        }
    });

    db.get("SELECT COUNT(*) as count FROM completed_coupons", (err, row) => {
        if (err) {
            console.error('수행목록 카운트 조회 실패:', err);
            return;
        }
        if (row && row.count === 0) {
            db.run(`INSERT INTO completed_coupons (issued_id, date, performer, content, amount) VALUES 
                (1, '25.12.10.', '정지윤', '카레만들기', '3시금(1시간 30분)')`, (err) => {
                if (err) {
                    console.error('초기 데이터 삽입 실패:', err);
                }
            });
        }
    });
}

// API 라우트

// 발급목록 조회 (발급일자 오래된 순으로 정렬)
app.get('/api/coupons/issued', (req, res) => {
    db.all("SELECT * FROM issued_coupons ORDER BY date ASC, created_at ASC", (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows.map((row, index) => ({
            ...row,
            order: index + 1
        })));
    });
});

// 수행목록 조회
app.get('/api/coupons/completed', (req, res) => {
    db.all("SELECT * FROM completed_coupons ORDER BY id", (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows.map((row, index) => ({
            ...row,
            order: index + 1
        })));
    });
});

// 발급목록 추가
app.post('/api/coupons/issued', (req, res) => {
    const { date, worker, content, amount, issuer } = req.body;
    
    if (!date || !worker || !content || !amount) {
        res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
        return;
    }

    db.run(
        "INSERT INTO issued_coupons (date, worker, content, amount, issuer) VALUES (?, ?, ?, ?, ?)",
        [date, worker, content, amount, issuer || null],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID, date, worker, content, amount, issuer });
        }
    );
});

// 수행목록 추가
app.post('/api/coupons/completed', (req, res) => {
    const { date, performer, content, amount, issued_id, photo } = req.body;
    
    if (!date || !content || !amount || !issued_id) {
        res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
        return;
    }

    db.run(
        "INSERT INTO completed_coupons (issued_id, date, performer, content, amount, photo) VALUES (?, ?, ?, ?, ?, ?)",
        [issued_id, date, performer || null, content, amount, photo || null],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID, issued_id, date, performer, content, amount, photo });
        }
    );
});

// 발급목록 조회 (단일)
app.get('/api/coupons/issued/:id', (req, res) => {
    const id = req.params.id;
    db.get("SELECT * FROM issued_coupons WHERE id = ?", [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: '쿠폰을 찾을 수 없습니다.' });
            return;
        }
        res.json(row);
    });
});

// 수행목록 조회 (단일)
app.get('/api/coupons/completed/:id', (req, res) => {
    const id = req.params.id;
    db.get("SELECT * FROM completed_coupons WHERE id = ?", [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: '쿠폰을 찾을 수 없습니다.' });
            return;
        }
        res.json(row);
    });
});

// 발급목록 수정
app.put('/api/coupons/issued/:id', (req, res) => {
    const id = req.params.id;
    const { date, worker, content, amount, issuer } = req.body;
    
    if (!date || !worker || !content || !amount) {
        res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
        return;
    }

    db.run(
        "UPDATE issued_coupons SET date = ?, worker = ?, content = ?, amount = ?, issuer = ? WHERE id = ?",
        [date, worker, content, amount, issuer || null, id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            if (this.changes === 0) {
                res.status(404).json({ error: '쿠폰을 찾을 수 없습니다.' });
                return;
            }
            res.json({ id, date, worker, content, amount, issuer });
        }
    );
});

// 수행목록 수정
app.put('/api/coupons/completed/:id', (req, res) => {
    const id = req.params.id;
    const { date, performer, content, amount, issued_id, photo } = req.body;
    
    if (!date || !content || !amount) {
        res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
        return;
    }

    db.run(
        "UPDATE completed_coupons SET date = ?, performer = ?, content = ?, amount = ?, issued_id = ?, photo = ? WHERE id = ?",
        [date, performer || null, content, amount, issued_id || null, photo || null, id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            if (this.changes === 0) {
                res.status(404).json({ error: '쿠폰을 찾을 수 없습니다.' });
                return;
            }
            res.json({ id, issued_id, date, performer, content, amount, photo });
        }
    );
});

// 발급목록 삭제
app.delete('/api/coupons/issued/:id', (req, res) => {
    const id = req.params.id;
    db.run("DELETE FROM issued_coupons WHERE id = ?", [id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: '쿠폰을 찾을 수 없습니다.' });
            return;
        }
        res.json({ message: '쿠폰이 삭제되었습니다.' });
    });
});

// 수행목록 삭제
app.delete('/api/coupons/completed/:id', (req, res) => {
    const id = req.params.id;
    
    // 먼저 삭제할 수행 쿠폰의 issued_id 확인
    db.get("SELECT issued_id FROM completed_coupons WHERE id = ?", [id], (err, completedRow) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!completedRow) {
            res.status(404).json({ error: '쿠폰을 찾을 수 없습니다.' });
            return;
        }
        
        const issuedId = completedRow.issued_id;
        
        // 해당 issued_id를 가진 수행 쿠폰 개수 확인
        db.get("SELECT COUNT(*) as count FROM completed_coupons WHERE issued_id = ?", [issuedId], (err, countRow) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            const completedCount = countRow.count;
            
            // 수행 쿠폰 삭제
            db.run("DELETE FROM completed_coupons WHERE id = ?", [id], function(deleteErr) {
                if (deleteErr) {
                    res.status(500).json({ error: deleteErr.message });
                    return;
                }
                if (this.changes === 0) {
                    res.status(404).json({ error: '쿠폰을 찾을 수 없습니다.' });
                    return;
                }
                
                // 수행 쿠폰이 1개였던 경우 (삭제 후 0개가 됨), 발급 쿠폰도 삭제하고 순서 재정렬
                if (completedCount === 1) {
                    // 발급 쿠폰 삭제
                    db.run("DELETE FROM issued_coupons WHERE id = ?", [issuedId], (issuedDeleteErr) => {
                        if (issuedDeleteErr) {
                            res.status(500).json({ error: issuedDeleteErr.message });
                            return;
                        }
                        
                        // 모든 발급 쿠폰을 날짜 순으로 가져와서 순서 재정렬
                        db.all("SELECT id FROM issued_coupons ORDER BY date ASC, created_at ASC", (reorderErr, issuedRows) => {
                            if (reorderErr) {
                                res.status(500).json({ error: reorderErr.message });
                                return;
                            }
                            
                            // 순서 재정렬은 클라이언트에서 order를 계산하므로 서버에서는 완료 응답만 보냄
                            res.json({ 
                                message: '쿠폰이 삭제되었습니다.',
                                deletedIssuedId: issuedId,
                                reorder: true
                            });
                        });
                    });
                } else {
                    // 수행 쿠폰이 2개 이상이었던 경우, 수행 쿠폰만 삭제
                    res.json({ message: '쿠폰이 삭제되었습니다.' });
                }
            });
        });
    });
});

// 방명록 API

// 방명록 조회
app.get('/api/guestbook', (req, res) => {
    db.all("SELECT * FROM guestbook ORDER BY created_at ASC", (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// 방명록 추가
app.post('/api/guestbook', (req, res) => {
    const { message } = req.body;
    
    console.log('방명록 추가 요청:', { message });
    
    if (!message || !message.trim()) {
        console.error('방명록 추가 실패: 메시지가 없음');
        res.status(400).json({ error: '메시지가 필요합니다.' });
        return;
    }
    
    db.run("INSERT INTO guestbook (message) VALUES (?)", [message.trim()], function(err) {
        if (err) {
            console.error('방명록 추가 데이터베이스 오류:', err);
            res.status(500).json({ error: `데이터베이스 오류: ${err.message}` });
            return;
        }
        console.log('방명록 추가 성공:', { id: this.lastID, message: message.trim() });
        res.json({ id: this.lastID, message: message.trim(), created_at: new Date().toISOString() });
    });
});

// 테스트 메시지 삭제 (새로고침 시 호출)
app.delete('/api/guestbook/test', (req, res) => {
    db.run("DELETE FROM guestbook WHERE message LIKE '테스트%'", (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: '테스트 메시지가 삭제되었습니다.' });
    });
});

// 방명록 전체 삭제
app.delete('/api/guestbook/all', (req, res) => {
    db.run("DELETE FROM guestbook", (err) => {
        if (err) {
            console.error('방명록 전체 삭제 실패:', err);
            res.status(500).json({ error: err.message });
            return;
        }
        console.log('방명록 전체 삭제 성공');
        res.json({ message: '모든 방명록이 삭제되었습니다.' });
    });
});

// 서버 시작 (0.0.0.0으로 바인딩하여 모든 네트워크 인터페이스에서 접근 가능)
app.listen(PORT, '0.0.0.0', () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
    console.log(`다른 기기에서 접근: http://[서버IP]:${PORT}`);
});

// 프로세스 종료 시 데이터베이스 연결 종료
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('데이터베이스 연결이 종료되었습니다.');
        process.exit(0);
    });
});

