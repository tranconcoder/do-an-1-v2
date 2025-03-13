// homeDanhGiaSp.jsx (Remember to rename the file to .jsx)

import React, { useState } from "react";
import styles from "./styles.module.scss";

const HomeDanhGiaSp = () => {
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const handleAskQuestionClick = () => setShowQuestionForm(!showQuestionForm);
  const [reviews, setReviews] = useState([
    {
      id: 1,
      author: "Mai Khánh Công",
      phone: "05882124xx",
      rating: 5,
      comment: "Mình đặt hàng thì có cài rom quốc tế ko hả shop",
      date: "12:17 20/12/2024",
      likes: 0,
      staffReply: null,
      isCustomer: true,
    },
    {
      id: 2,
      author: "Đỗ Thúy Mai",
      phone: null,
      rating: null,
      comment:
        "Dạ em chào anh ạ. Cảm ơn anh đã ủng hộ Mobilecity, em đã liên hệ qua số điện thoại mình để hỗ trợ chính xác nhất cho anh rồi ạ. Rất vui được hỗ trợ anh ạ.",
      date: "15:16 20/12/2024",
      likes: 0,
      isStaff: true,
      isManager: true, // added isManager
      staffReply: null,
      isCustomer: false,
    },
    {
      id: 3,
      author: "thien",
      phone: "07083891xx",
      rating: 4,
      comment: "máy này là máy mới 100% lun hả shop",
      date: "16:34 15/11/2024",
      likes: 0,
      staffReply: "Chào bạn, máy là hàng mới 100% ạ!",
      isCustomer: true,
    },
    {
      id: 4,
      author: "Nguyễn Văn B",
      phone: null,
      rating: null,
      comment: "Cần thêm thông tin gì, bạn cứ hỏi nhé!",
      date: "17:00 15/11/2024",
      likes: 0,
      isStaff: true,
      isManager: false, // added isManager
      staffReply: null,
      isCustomer: false,
    },
  ]);

  const [currentPage, setCurrentPage] = useState(1); // New state for current page
  const reviewsPerPage = 3; // Set the number of reviews to display per page

  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(
    indexOfFirstReview,
    indexOfLastReview
  ); // Slice the reviews array for pagination

  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const translateString = (str: string) => {
    if (str === "<") return "Trái";
    if (str === ">") return "Phải";
    return str;
  };

  // State for question form values
  const [questionName, setQuestionName] = useState("");
  const [questionEmail, setQuestionEmail] = useState("");
  const [questionContent, setQuestionContent] = useState("");

  const handleQuestionSubmit = () => {
    // Here, add the code to process the user questions
    console.log("Submitting question:", {
      name: questionName,
      email: questionEmail,
      content: questionContent,
    });
    // Reset the forms after submission
    setQuestionName("");
    setQuestionEmail("");
    setQuestionContent("");
    setShowQuestionForm(false);
  };

  return (
    <div
      className={styles.danhGiaContainer}
      style={{ width: "1200px", margin: "20px auto" }}
    >
      <div className={styles.header}>
        Hỏi đáp & đánh giá Xiaomi Redmi 12C (Helio G85)
      </div>

      <div className={styles.ratingSummary}>
        <div className={styles.overallRating}>
          <div className={styles.ratingValue}>5/5</div>
          <div className={styles.stars}>
            <span>⭐</span>
            <span>⭐</span>
            <span>⭐</span>
            <span>⭐</span>
            <span>⭐</span>
          </div>
          <div className={styles.reviewCount}>9 đánh giá và hỏi đáp</div>
        </div>

        <div className={styles.ratingBreakdown}>
          <div className={styles.ratingRow}>
            <div className={styles.starLabel}>5 Sao</div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressBarFill}
                style={{ width: "100%" }}
              ></div>
            </div>
            <div className={styles.reviewNumber}>9</div>
          </div>
          <div className={styles.ratingRow}>
            <div className={styles.starLabel}>4 Sao</div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressBarFill}
                style={{ width: "0%" }}
              ></div>
            </div>
            <div className={styles.reviewNumber}>0</div>
          </div>
          <div className={styles.ratingRow}>
            <div className={styles.starLabel}>3 Sao</div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressBarFill}
                style={{ width: "0%" }}
              ></div>
            </div>
            <div className={styles.reviewNumber}>0</div>
          </div>
          <div className={styles.ratingRow}>
            <div className={styles.starLabel}>2 Sao</div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressBarFill}
                style={{ width: "0%" }}
              ></div>
            </div>
            <div className={styles.reviewNumber}>0</div>
          </div>
          <div className={styles.ratingRow}>
            <div className={styles.starLabel}>1 Sao</div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressBarFill}
                style={{ width: "100%" }}
              ></div>
            </div>
            <div className={styles.reviewNumber}>9</div>
          </div>
        </div>

        <div className={styles.askQuestion}>
          <div className={styles.questionText}>Bạn có vấn đề cần tư vấn?</div>
          <button
            className={styles.questionButton}
            onClick={handleAskQuestionClick}
          >
            Gửi câu hỏi
          </button>
        </div>
      </div>

      {showQuestionForm && (
        <div className={styles.questionForm}>
          <div className={styles.formHeader}>Đặt câu hỏi của khách hàng</div>
          <textarea
            className={styles.commentBox}
            placeholder="Nhập câu hỏi của bạn"
            value={questionContent}
            onChange={(e) => setQuestionContent(e.target.value)}
          ></textarea>
          <input
            type="text"
            className={styles.inputField}
            placeholder="Họ và Tên..."
            value={questionName}
            onChange={(e) => setQuestionName(e.target.value)}
          />
          <input
            type="email"
            className={styles.inputField}
            placeholder="Email"
            value={questionEmail}
            onChange={(e) => setQuestionEmail(e.target.value)}
          />
          <div className={styles.formActions}>
            <button
              className={styles.cancelButton}
              onClick={() => setShowQuestionForm(false)}
            >
              Hủy
            </button>
            <button
              className={styles.submitButton}
              onClick={handleQuestionSubmit}
            >
              Gửi
            </button>
          </div>
        </div>
      )}

      <div className={styles.reviewForm}>
        <div className={styles.formHeader}>
          Bạn chấm sản phẩm này bao nhiêu sao?
        </div>
        <div className={styles.starRating}>
          <span>⭐</span>
          <span>⭐</span>
          <span>⭐</span>
          <span>⭐</span>
          <span>⭐</span>
        </div>
        <textarea
          className={styles.commentBox}
          placeholder="Mời bạn để lại đánh giá, bình luận (Vui lòng nhập tiếng việt có dấu)"
        ></textarea>
        <input
          type="text"
          className={styles.inputField}
          placeholder="Họ và Tên..."
        />
        <input
          type="tel"
          className={styles.inputField}
          placeholder="Số siện thoại"
        />
        <input type="email" className={styles.inputField} placeholder="Email" />

        <div className={styles.formActions}>
          <button className={styles.cancelButton}>✖ Hủy</button>
          <button className={styles.submitButton}>Gửi</button>
        </div>
      </div>

      <input
        type="text"
        className={styles.searchBox}
        placeholder="Tìm theo nội dung, người gửi,..."
      />

      <div className={styles.reviewList}>
        {currentReviews.map((review, index) => (
          <div className={styles.reviewItem} key={review.id}>
            <div className={styles.reviewHeader}>
              <div className={styles.authorInfo}>
                <span className={styles.authorName}>{review.author}</span>
                {review.phone && (
                  <span className={styles.authorPhone}> {review.phone}</span>
                )}
                {review.isStaff && (
                  <span
                    className={`${styles.staffBadge} ${
                      review.isManager ? styles.managerBadge : ""
                    }`}
                  >
                    Quản trị viên
                  </span>
                )}
                {review.isCustomer && (
                  <span className={styles.customerBadge}>Khách hàng</span>
                )}
              </div>
              {review.rating && (
                <div className={styles.ratingStars}>
                  {Array.from({ length: review.rating || 0 }, (_, i) => (
                    <span key={i}>⭐</span>
                  ))}
                </div>
              )}
            </div>
            <div className={styles.reviewContent}>{review.comment}</div>
            <div className={styles.reviewFooter}>
              <span className={styles.reviewDate}>{review.date}</span>
              <span className={styles.reviewLikes}>{review.likes} Thích</span>
            </div>
            {review.staffReply && (
              <div className={styles.staffReply}>
                <div className={styles.reviewHeader}>
                  <div className={styles.authorInfo}>
                    <span className={styles.authorName}>Nhân viên</span>
                    <span className={styles.staffBadge}>Quản trị viên</span>
                  </div>
                </div>
                <div className={styles.reviewContent}>{review.staffReply}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination Component */}
      <div className={styles.pagination}>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          {translateString("<")}
        </button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => handlePageChange(i + 1)}
            className={currentPage === i + 1 ? styles.active : ""}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          {translateString(">")}
        </button>
      </div>
    </div>
  );
};

export default HomeDanhGiaSp;