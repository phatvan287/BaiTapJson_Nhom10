const fs = require('fs');
const readline = require('readline');

const DATABASE_FILE = 'database.json';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout }); // Single readline instance

// Đọc dữ liệu từ file JSON
function loadDatabase() {
  return JSON.parse(fs.readFileSync(DATABASE_FILE, 'utf8'));
}

// Lưu dữ liệu vào file JSON
function saveDatabase(data) {
  fs.writeFileSync(DATABASE_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// Hàm hiển thị menu chính
function showMainMenu() {
  console.log(`---HE THONG QUAN LY PHONG NET---
  1. Người chơi
  2. Nhân viên
  3. Quản trị
  4. Thoát`);
}

// Xử lý đăng nhập
function login(role) {
  const db = loadDatabase();

  rl.question("Tên đăng nhập: ", (username) => {
    rl.question("Mật khẩu: ", (password) => {
      if (role === 'player') {
        const user = db.users.find(u => u.username === username && u.password === password);
        if (user) {
          console.log(`Chào mừng ${user.name} đến với thế giới game!`);
          playerMenu(user);
        } else {
          console.log("Đăng nhập thất bại!");
          main(); // Return to main menu
        }
      } else if (role === 'employee') {
        const employee = db.employees.find(e => e.username === username && e.password === password);
        if (employee) {
          console.log(`Xin chào nhân viên ${employee.name}`);
          employeeMenu(employee);
        } else {
          console.log("Đăng nhập thất bại!");
          main(); // Return to main menu
        }
      } else if (role === 'admin' && username === db.admin.username && password === db.admin.password) {
        console.log("Xin chào Admin!");
        adminMenu();
      } else {
        console.log("Đăng nhập thất bại!");
        main(); // Return to main menu
      }
    });
  });
}

// Menu người chơi
function playerMenu(user) {
  console.log(`1. Chơi game
2. Kiểm tra số tiền
3. Nạp tiền
4. Thoát`);

  rl.question("Lựa chọn: ", (choice) => {
    const db = loadDatabase();
    if (choice === '1') {
      rl.question("Nhập thời gian chơi (phút): ", (time) => {
        const cost = time * 1000; // 1000đ/phút
        if (user.balance >= cost) {
          user.balance -= cost;
          saveDatabase(db);
          console.log(`Bạn đã chơi ${time} phút. Số dư còn lại: ${user.balance}đ`);
        } else {
          console.log("Số dư không đủ!");
        }
        playerMenu(user); // Return to player menu
      });
    } else if (choice === '2') {
      console.log(`Số dư tài khoản: ${user.balance}đ`);
      playerMenu(user); // Return to player menu
    } else if (choice === '3') {
      rl.question("Nhập số tiền nạp: ", (amount) => {
        user.balance += parseInt(amount);
        saveDatabase(db);
        console.log(`Nạp thành công! Số dư mới: ${user.balance}đ`);
        playerMenu(user); // Return to player menu
      });
    } else if (choice === '4') {
      main(); // Return to main menu
    } else {
      console.log("Lựa chọn không hợp lệ. Vui lòng thử lại.");
      playerMenu(user); // Return to player menu
    }
  });
}

// Menu nhân viên
function employeeMenu(employee) {
  console.log(`1. Báo cáo tình trạng máy
2. Báo cáo vi phạm
3. Thoát`);

  rl.question("Lựa chọn: ", (choice) => {
    const db = loadDatabase();
    if (choice === '1') {
      rl.question("Nhập số phòng: ", (roomId) => {
        rl.question("Nhập số thứ tự máy: ", (computerId) => {
          rl.question("Nhập tình trạng máy: ", (status) => {
            const room = db.rooms.find(r => r.id == roomId);
            if (room) {
              const computer = room.computers.find(c => c.id == computerId);
              if (computer) {
                computer.status = status;
                saveDatabase(db);
                console.log("Cập nhật thành công!");
              } else {
                console.log("Không tìm thấy máy!");
              }
            } else {
              console.log("Không tìm thấy phòng!");
            }
            employeeMenu(employee); // Return to employee menu
          });
        });
      });
    } else if (choice === '2') {
      rl.question("Nhập tên đăng nhập vi phạm: ", (username) => {
        rl.question("Nhập hành vi vi phạm: ", (violation) => {
          db.reports.push({ username, violation });
          saveDatabase(db);
          console.log("Báo cáo đã được lưu!");
          employeeMenu(employee); // Return to employee menu
        });
      });
    } else if (choice === '3') {
      main(); // Return to main menu
    } else {
      console.log("Lựa chọn không hợp lệ. Vui lòng thử lại.");
      employeeMenu(employee); // Return to employee menu
    }
  });
}

// Menu quản trị viên
function adminMenu() {
  console.log(`1. Xem doanh thu
2. Xem tình trạng máy
3. Xem báo cáo vi phạm
4. Thoát`);

  rl.question("Lựa chọn: ", (choice) => {
    const db = loadDatabase();
    if (choice === '1') {
      // Option 1: View revenue
      const totalRevenue = db.users.reduce((sum, user) => sum + (50000 - user.balance), 0); // Example calculation
      console.log(`Tổng doanh thu: ${totalRevenue}đ`);
      adminMenu(); // Return to admin menu
    } else if (choice === '2') {
      // Option 2: View computer statuses
      db.rooms.forEach(room => {
        console.log(`Phòng: ${room.name}`);
        room.computers.forEach(computer => {
          console.log(`  Máy ${computer.id}: ${computer.status}`);
        });
      });
      adminMenu(); // Return to admin menu
    } else if (choice === '3') {
      // Option 3: View violation reports
      if (db.reports.length === 0) {
        console.log("Không có báo cáo vi phạm nào.");
      } else {
        db.reports.forEach((report, index) => {
          console.log(`${index + 1}. Người dùng: ${report.username}, Hành vi: ${report.violation}`);
        });
      }
      adminMenu(); // Return to admin menu
    } else if (choice === '4') {
      // Option 4: Exit to main menu
      main(); // Return to main menu
    } else {
      console.log("Lựa chọn không hợp lệ. Vui lòng thử lại.");
      adminMenu(); // Return to admin menu
    }
  });
}

// Chạy chương trình
function main() {
  function handleMainMenu() {
    showMainMenu();
    rl.question("Lựa chọn: ", (choice) => {
      if (choice === '1') login('player');
      else if (choice === '2') login('employee');
      else if (choice === '3') login('admin');
      else if (choice === '4') {
        console.log("Thoát chương trình!");
        rl.close();
      } else {
        console.log("Lựa chọn không hợp lệ. Vui lòng thử lại.");
        handleMainMenu(); // Show the menu again after handling the choice
      }
    });
  }

  handleMainMenu(); // Start the main menu loop
}

main();
