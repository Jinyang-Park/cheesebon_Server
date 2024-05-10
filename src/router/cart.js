import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

router.use((req, res, next) => {
  console.log('middleware for cart!');
  next();
});

// 장바구니
router.post('/cart', (req, res) => {
  const cart = req.body;

  // cart 데이터를 MySQL에 저장하는 쿼리를 작성
  const query = 'INSERT INTO cart (cart_data) VALUES (?)';

  db.query(query, [JSON.stringify(cart)], (error, result) => {
    if (error) {
      console.log(error);
      res.status(500).send({ message: 'Server Error' });
    } else {
      console.log('cart_date', cart);
      res.status(200).send({ message: 'Cart saved successfully' });
    }
  });
});

// 장바구니 정보 가져오기
router.get('/getPaidCart', (req, res) => {
  const query = 'SELECT * FROM cart';

  db.query(query, (error, result) => {
    if (error) {
      console.log(error);
      res.status(500).send({ message: 'Server Error' });
    } else {
      const parseCartResults = result.map((result) => {
        return {
          ...result,
          cart_data: JSON.parse(result.cart_data),
        };
      });
      // 결과를 클라이언트에게 반환
      res.status(200).send({ cartdata: parseCartResults });
    }
  });
});

// 결제 상품 취소
router.delete('/delete/:id', (req, res) => {
  const itemId = parseInt(req.params.id);

  const query = 'DELETE FROM cart WHERE id = ?';

  db.query(query, [itemId], (error, result) => {
    if (error) {
      console.log(error);
      res.status(500).send({ message: 'Server Error' });
    } else {
      res.status(200).send({ message: 'Successfully deleted' });
    }
  });
});

// 결제 날짜 시간 취소
router.delete('/deleteDateTime/:id', (req, res) => {
  const DateTimeId = parseInt(req.params.id);

  const query = 'DELETE FROM paidTime WHERE id = ?';

  db.query(query, [DateTimeId], (error, result) => {
    if (error) {
      console.log(error);
      res.status(500).send({ message: 'Server Error' });
    } else {
      res.status(200).send({ message: 'Successfully deleted' });
    }
  });
});

// 날짜와 시간 저장
router.post('/savePaidTime', (req, res) => {
  const dateTime = req.body.dateTime;

  // dateTime 데이터를 MySQL에 저장하는 쿼리를 작성
  const query = 'INSERT INTO paidTime (dateTime_data) VALUES (?)';

  db.query(query, [JSON.stringify(dateTime)], (error, result) => {
    if (error) {
      console.log(error);
      res.status(500).send({ message: 'Server Error' });
    } else {
      console.log('dateTime_data', dateTime);
      res.status(200).send({ message: 'DateTime save successful' });
    }
  });
});

// 날짜와 시간 가져오기
router.get('/getPaidTime', (req, res) => {
  // paidTime' 테이블에서 데이터를 가져오는 쿼리를 작성
  const query = 'SELECT * FROM paidTime';

  db.query(query, (error, result) => {
    if (error) {
      console.log(error);
      res.status(500).send({ message: 'Server Error' });
    } else {
      const parsedResults = result.map((result) => {
        return {
          ...result,
          dateTime_data: JSON.parse(result.dateTime_data),
        };
      });
      // 결과를 클라이언트에게 반환
      res.status(200).send({ dateTime: parsedResults });
    }
  });
});
export default router;
