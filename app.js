// Khai báo các gói sử dụng
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");

// Sử dụng Express để tạo ứng dụng
const app = express();

// Sử dụng các gói phụ thuộc
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Kết nối tới cơ sở dữ liệu MongoDB
const mongoURI =
  "mongodb+srv://hauncph23182:KDCmBivkwk8nWTJI@mydatabase.inj6nec.mongodb.net/?retryWrites=true&w=majority"; // Thay đổi tùy theo tên database và cổng MongoDB của bạn
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Định nghĩa schema cho hình ảnh
const imageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String, required: true },
  copyright: { type: String, required: true },
  date: { type: Date, required: true },
  explanation: { type: String, required: true },
});

// Tạo model dựa trên schema
const Image = mongoose.model("Image", imageSchema);

// API upload ảnh
app.post("/upload", (req, res) => {
  const { title, image, copyright, date, explanation } = req.body;

  // Kiểm tra xem dữ liệu gửi lên đủ không
  if (!title || !image || !copyright || !date || !explanation) {
    return res.json({ status: false, message: "Lack of information!" });
  }

  // Tạo một bản ghi mới trong cơ sở dữ liệu
  const newImage = new Image({
    title,
    image,
    copyright,
    date,
    explanation,
  });

  newImage
    .save()
    .then(() => {
      console.log("1 record has been inserted");
      res.json({ status: true, message: "1 record has been inserted" });
    })
    .catch((err) => {
      console.error("Error inserting record:", err);
      res.json({ status: false, message: "Error inserting record" });
    });
});

// TODO: API /get-image
app.get("/get-image", async (req, res) => {
  try {
    const images = await Image.find({});
    res.json({ status: true, data: images });
  } catch (err) {
    console.error("Error retrieving images:", err);
    res.json({ status: false, message: "Error retrieving images" });
  }
});

// TODO: API /delete-image
app.delete("/delete-image", async (req, res) => {
  const { _id } = req.body;

  // Kiểm tra xem trường _id đã được gửi lên hay chưa
  if (!_id) {
    return res.json({
      status: false,
      message: "Please provide _id of the image to delete!",
    });
  }

  try {
    // Tìm hình ảnh cần xóa dựa vào _id và xóa nó trong cơ sở dữ liệu
    const deletedImage = await Image.findOneAndDelete({ _id });

    if (!deletedImage) {
      return res.json({ status: false, message: "Image not found!" });
    }

    res.json({ status: true, message: "Image has been deleted successfully!" });
  } catch (err) {
    console.error("Error deleting image:", err);
    res.json({ status: false, message: "Error deleting image" });
  }
});

// TODO: API /update-image
app.put("/update-image", async (req, res) => {
  const { _id, title, image, copyright, date, explanation } = req.body;

  // Kiểm tra xem trường _id và ít nhất một trường dữ liệu cần cập nhật đã được gửi lên hay chưa
  if (!_id || (!title && !image && !copyright && !date && !explanation)) {
    return res.json({
      status: false,
      message: "Insufficient information for updating!",
    });
  }

  try {
    // Tìm hình ảnh cần cập nhật dựa vào _id
    const imageToUpdate = await Image.findById(_id);

    if (!imageToUpdate) {
      return res.json({ status: false, message: "Image not found!" });
    }

    // Cập nhật các trường dữ liệu mới (nếu có) cho hình ảnh
    if (title) {
      imageToUpdate.title = title;
    }
    if (image) {
      imageToUpdate.image = image;
    }
    if (copyright) {
      imageToUpdate.copyright = copyright;
    }
    if (date) {
      imageToUpdate.date = date;
    }
    if (explanation) {
      imageToUpdate.explanation = explanation;
    }

    // Lưu hình ảnh đã cập nhật vào cơ sở dữ liệu
    await imageToUpdate.save();

    res.json({ status: true, message: "Image has been updated successfully!" });
  } catch (err) {
    console.error("Error updating image:", err);
    res.json({ status: false, message: "Error updating image" });
  }
});

// Port server node chạy
const port = 3000; // Có thể thay đổi cổng tại đây

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
