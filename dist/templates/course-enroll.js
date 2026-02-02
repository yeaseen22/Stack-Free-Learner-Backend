"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enrollmentSuccessTemplate = void 0;
const enrollmentSuccessTemplate = ({ name, courseTitle, transactionId, batchNo, }) => {
    return `<!DOCTYPE html>
<html lang="bn">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>এনরোলমেন্ট সফল</title>
    <style>
      body {
        font-family: 'Segoe UI', sans-serif;
        background-color: #f0f2f5;
        margin: 0;
        padding: 0;
        color: #333;
      }

      .email-container {
        max-width: 600px;
        margin: 30px auto;
        background-color: #ffffff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 0 10px rgba(0,0,0,0.05);
      }

      .header {
        background-color: #007bff;
        padding: 20px;
        text-align: center;
        color: #fff;
      }

      .header img {
        max-height: 60px;
        margin-bottom: 10px;
      }

      .content {
        padding: 30px;
      }

      .title {
        font-size: 22px;
        font-weight: 600;
        margin-bottom: 15px;
        color: #155724;
      }

      .message {
        font-size: 16px;
        margin-bottom: 25px;
      }

      .info-box {
        background-color: #f9f9f9;
        border: 1px solid #dee2e6;
        border-radius: 5px;
        padding: 20px;
        margin-bottom: 25px;
      }

      .info-box h4 {
        margin-top: 0;
        font-size: 16px;
        margin-bottom: 10px;
        color: #007bff;
      }

      .info-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
        font-size: 15px;
      }

      .steps {
        margin-bottom: 30px;
      }

      .steps ol {
        padding-left: 20px;
      }

      .button {
        display: inline-block;
        padding: 12px 24px;
        background-color: #28a745;
        color: white;
        text-decoration: none;
        border-radius: 5px;
        font-weight: bold;
        transition: background 0.3s ease;
      }

      .button:hover {
        background-color: #218838;
      }

      .footer {
        background-color: #f1f3f5;
        text-align: center;
        padding: 20px;
        font-size: 14px;
        color: #6c757d;
      }

      .social-links a {
        margin: 0 8px;
        text-decoration: none;
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 14px;
      }

      .youtube { background: #ff0000; }
      .facebook { background: #1877f2; }
      .linkedin { background: #0077b5; }

      @media (max-width: 600px) {
        .info-item {
          flex-direction: column;
        }
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <!-- Header -->
      <div class="header">
        <img src="https://i.ibb.co/JWtfwFML/logo.png" alt="Programming Fighter" />
        <h2>Programming Fighter</h2>
      </div>

      <!-- Content -->
      <div class="content">
        <div class="title">✅ অভিনন্দন, আপনার এনরোলমেন্ট সফল হয়েছে!</div>
        <p class="message">প্রিয় ${name},<br/>আপনি <strong>${courseTitle}</strong> কোর্সে সফলভাবে এনরোল করেছেন। নিচে আপনার এনরোলমেন্টের বিস্তারিত দেওয়া হলো:</p>

        <!-- Course Info -->
        <div class="info-box">
          <h4>কোর্স তথ্য:</h4>
          <div class="info-item"><span>কোর্স:</span> <span><strong>${courseTitle}</strong></span></div>
          <div class="info-item"><span>ব্যাচ:</span> <span><strong>0${batchNo}</strong></span></div>
          <div class="info-item"><span>তারিখ:</span> <span><strong>${new Date().toLocaleDateString("bn-BD")}</strong></span></div>
        </div>

        <!-- Payment Info -->
        <div class="info-box">
          <h4>পেমেন্ট তথ্য:</h4>
          <div class="info-item"><span>ট্রানজেকশন আইডি:</span> <span><strong>${transactionId}</strong></span></div>
          <div class="info-item"><span>স্ট্যাটাস:</span> <span><strong>সফল ✅</strong></span></div>
        </div>

        <!-- Steps -->
        <div class="steps">
          <h4>পরবর্তী করণীয়:</h4>
          <ol>
            <li>অ্যাকাউন্টে লগইন করুন</li>
            <li>ড্যাশবোর্ডে যান</li>
            <li>প্রথম ক্লাস শুরু করুন</li>
            <li>কমিউনিটিতে যুক্ত হন</li>
          </ol>
        </div>

        <div style="text-align: center;">
          <a href="#" class="button">কোর্স শুরু করুন</a>
        </div>

        <p style="margin-top: 20px;"><strong>সাহায্য প্রয়োজন?</strong> আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন।</p>

        <!-- Social -->
        <div class="social-links" style="text-align: center; margin-top: 30px;">
          <a href="#" class="youtube">YouTube</a>
          <a href="#" class="facebook">Facebook</a>
          <a href="#" class="linkedin">LinkedIn</a>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p><strong>Programming Fighter</strong></p>
        <p>© ${new Date().getFullYear()} সকল অধিকার সংরক্ষিত</p>
      </div>
    </div>
  </body>
</html>`;
};
exports.enrollmentSuccessTemplate = enrollmentSuccessTemplate;
