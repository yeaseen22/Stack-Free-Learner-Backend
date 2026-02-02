interface AnnouncementProps {
  name: string;
  courseTitle: string;
  batch: string | number;
  announcementTitle: string;
  announcementContent: string;
  instructorName?: string;
  announcementDate?: string;
}

export const announcementTemplate = ({
  name,
  courseTitle,
  batch,
  announcementTitle,
  announcementContent,
  instructorName = "The Course Team",
  announcementDate = new Date().toLocaleDateString(),
}: AnnouncementProps): string => {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>New Announcement: ${announcementTitle}</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
      body {
        font-family: 'Poppins', sans-serif;
        background-color: #FFF5F5;
        margin: 0;
        padding: 0;
        color: #333;
        line-height: 1.6;
      }

      .email-container {
        max-width: 600px;
        margin: 30px auto;
        background-color: #ffffff;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(255, 105, 71, 0.1);
      }

      .header {
        background: linear-gradient(135deg, #FF7043 0%, #FF8A65 100%);
        padding: 30px;
        text-align: center;
        color: white;
      }

      .header img {
        max-height: 70px;
        margin-bottom: 15px;
      }

      .header h2 {
        margin: 0;
        font-weight: 700;
        font-size: 28px;
        text-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }

      .content {
        padding: 35px;
      }

      .title {
        font-size: 26px;
        font-weight: 700;
        margin-bottom: 20px;
        color: #FF5722;
        position: relative;
        padding-bottom: 10px;
      }

      .title:after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 60px;
        height: 4px;
        background: linear-gradient(90deg, #FF7043 0%, #FF4081 100%);
        border-radius: 2px;
      }

      .greeting {
        font-size: 16px;
        margin-bottom: 25px;
        color: #555;
      }

      .announcement-card {
        background-color: #FFF9F2;
        border-radius: 12px;
        padding: 25px;
        margin-bottom: 30px;
        border-left: 5px solid #FF7043;
        box-shadow: 0 5px 15px rgba(255, 112, 67, 0.1);
      }

      .announcement-title {
        font-size: 22px;
        font-weight: 600;
        margin-top: 0;
        margin-bottom: 15px;
        color: #E64A19;
      }

      .announcement-meta {
        display: flex;
        justify-content: space-between;
        margin-bottom: 15px;
        font-size: 14px;
        color: #FF7043;
        font-weight: 500;
      }

      .announcement-content {
        font-size: 15px;
        white-space: pre-line;
        color: #555;
        line-height: 1.7;
      }

      .course-info {
        background: linear-gradient(135deg, rgba(255, 112, 67, 0.1) 0%, rgba(255, 138, 101, 0.1) 100%);
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 30px;
        border: 1px solid rgba(255, 112, 67, 0.2);
      }

      .info-item {
        display: flex;
        margin-bottom: 10px;
        font-size: 15px;
      }

      .info-label {
        font-weight: 600;
        min-width: 100px;
        color: #FF5722;
      }

      .button {
        display: inline-block;
        padding: 14px 28px;
        background: linear-gradient(90deg, #FF7043 0%, #FF4081 100%);
        color: white;
        text-decoration: none;
        border-radius: 50px;
        font-weight: 600;
        transition: all 0.3s ease;
        margin-top: 15px;
        box-shadow: 0 4px 15px rgba(255, 112, 67, 0.3);
        border: none;
        cursor: pointer;
        font-size: 16px;
      }

      .button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(255, 112, 67, 0.4);
      }

      .footer {
        background-color: #FFF5F5;
        text-align: center;
        padding: 25px;
        font-size: 14px;
        color: #FF7043;
        border-top: 1px solid rgba(255, 112, 67, 0.2);
      }

      .social-links {
        margin: 25px 0;
        text-align: center;
      }

      .social-links a {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin: 0 10px;
        text-decoration: none;
        color: white;
        padding: 10px 16px;
        border-radius: 50px;
        font-size: 14px;
        font-weight: 500;
        transition: transform 0.3s ease;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      }

      .social-links a:hover {
        transform: translateY(-3px);
      }

      .discord { background: #5865F2; }
      .youtube { background: #FF0000; }
      .facebook { background: #1877F2; }
      .instagram { background: linear-gradient(45deg, #F58529, #DD2A7B, #8134AF, #515BD4); }

      .emoji {
        font-size: 18px;
        margin-right: 8px;
      }

      @media (max-width: 600px) {
        .content {
          padding: 25px;
        }
        .info-item {
          flex-direction: column;
        }
        .announcement-meta {
          flex-direction: column;
          gap: 8px;
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
        <div class="title">✨ ${announcementTitle}</div>
        <p class="greeting">Hello ${name},</p>

        <!-- Course Info -->
        <div class="course-info">
          <div class="info-item">
            <span class="info-label">Course:</span>
            <span><strong>${courseTitle}</strong></span>
          </div>
          <div class="info-item">
            <span class="info-label">Batch:</span>
            <span><strong>${batch}</strong></span>
          </div>
        </div>

        <!-- Announcement Card -->

        <style>
            .announcement-meta {
                display: flex;
                gap: 1rem; /* Adjust the gap size as needed */
                flex-wrap: wrap; /* Optional: ensures responsiveness */
            }
        </style>

        <div class="announcement-card">
          <div class="announcement-meta">
            <span>👤 From: ${instructorName}</span>
            <span>📅 Date: ${announcementDate}</span>
          </div>
          <div class="announcement-content">
            ${announcementContent}
          </div>
        </div>

        <p style="margin-top: 25px; font-size: 14px; color: #FF7043; text-align: center;">
          <strong>Need help?</strong> Reply to this email or contact our support team at support@programming-fighter.com
        </p>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p><strong>© ${new Date().getFullYear()} Programming Fighter</strong></p>
        <p>Think Limitless</p>
      </div>
    </div>
  </body>
</html>`;
};
