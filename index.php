<?php
include './inc/header.php';
include_once 'lib/database.php';

$db = new Database();
$conn = $db->link;

if (session_status() === PHP_SESSION_NONE) {
  session_start();
}

if (empty($_SESSION['user_id'])) {
  $_SESSION['redirect_after_login'] = $_SERVER['REQUEST_URI'];
  header("Location: login.php");
  exit();
}

$cartItems = [];
$totalCartPrice = 0;

$userId = $_SESSION['user_id'];
$sql = "SELECT ci.*, p.name, p.image_url, p.price, p.discount 
        FROM cart_items ci 
        JOIN products p ON ci.product_id = p.product_id 
        WHERE ci.user_id = $userId
        ORDER BY ci.added_at DESC";

$result = $db->select($sql);

if ($result) {
  while ($row = $result->fetch_assoc()) {
    $price = $row['price'] * (1 - $row['discount'] / 100);
    $row['final_price'] = $price;
    $row['total'] = $price * $row['quantity'];
    $totalCartPrice += $row['total'];
    $cartItems[] = $row;
  }
}
$appliedDiscount = null;
$discountAmount = 0;

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['coupon_code'])) {
  $couponCode = strtoupper(trim($_POST['coupon_code']));
  $today = date('Y-m-d');

  $stmt = $conn->prepare("SELECT * FROM discounts WHERE code = ? AND valid_until >= ?");
  $stmt->bind_param("ss", $couponCode, $today);
  $stmt->execute();
  $discountResult = $stmt->get_result();

  if ($discountResult->num_rows > 0) {
    $_SESSION['applied_discount'] = $discountResult->fetch_assoc();
  } else {
    unset($_SESSION['applied_discount']);
  }
}

// Nếu có mã giảm giá trong session thì áp dụng
if (isset($_SESSION['applied_discount'])) {
  $appliedDiscount = $_SESSION['applied_discount'];
  $discountAmount = ($totalCartPrice * $appliedDiscount['discount_percent']) / 100;
}

$shippingFee = 30000; // Mặc định phí ship

if (!empty($userId)) {
  $stmt = $conn->prepare("SELECT city_code FROM user_addresses WHERE user_id = ? AND is_default = 1 LIMIT 1");
  $stmt->bind_param("i", $userId);
  $stmt->execute();
  $result = $stmt->get_result();

  if ($result && $result->num_rows > 0) {
    $address = $result->fetch_assoc();
    $cityCode = $address['city_code'];

    // Tính phí ship dựa trên city_code
    switch ($cityCode) {
      case 1:  // Hà Nội
      case 79: // TP. Hồ Chí Minh
        $shippingFee = 20000;
        break;
      case 48: // Đà Nẵng
      case 31: // Hải Phòng
      case 92: // Cần Thơ
        $shippingFee = 25000;
        break;
      default: // Các tỉnh khác
        $shippingFee = 30000;
        break;
    }
  }
}

// If you need to set shipping fee to 2500 for testing, uncomment this line:
// $shippingFee = 2500;

// Make sure JavaScript has access to the correct values
$grandTotal = $totalCartPrice - $discountAmount + $shippingFee;

// Add this to debug and verify the values
// echo "Debug: Total: $totalCartPrice, Discount: $discountAmount, Shipping: $shippingFee, Grand Total: $grandTotal";
?>

<div class="site__body">
  <div class="page-header">
    <div class="page-header__container container">
      <div class="page-header__breadcrumb">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb">
            <li class="breadcrumb-item">
              <a href="index.php">Trang chủ</a>
              <svg class="breadcrumb-arrow" width="6px" height="9px">
                <use
                  xlink:href="images/sprite.svg#arrow-rounded-right-6x9"></use>
              </svg>
            </li>
            <li class="breadcrumb-item active" aria-current="page">
              Giỏ hàng
            </li>
          </ol>
        </nav>
      </div>
      <div class="page-header__title">
        <h1>Giỏ hàng</h1>
      </div>
    </div>
  </div>
  <div class="cart block">
    <div class="container">
      <form method="POST" action="checkout.php" id="selected-items-form">
        <input type="hidden" name="selected_items_json" id="selected-items-json">
        <table class="cart__table cart-table">
          <thead class="cart-table__head">
            <tr class="cart-table__row">
              <th class="cart-table__column cart-table__column--select">
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" id="select-all">
                  <label class="form-check-label" for="select-all">Chọn</label>
                </div>
              </th>
              <th class="cart-table__column cart-table__column--image">
                Hình ảnh
              </th>
              <th class="cart-table__column cart-table__column--product">
                Sản phẩm
              </th>
              <th class="cart-table__column cart-table__column--price">
                Giá
              </th>
              <th class="cart-table__column cart-table__column--quantity">
                Số lượng
              </th>
              <th class="cart-table__column cart-table__column--total">
                Tổng cộng
              </th>
              <th
                class="cart-table__column cart-table__column--remove"></th>
            </tr>
          </thead>
          <tbody class="cart-table__body">
            <?php if (!empty($_SESSION['user_id'])): ?>
              <?php if (!empty($cartItems)): ?>
                <?php foreach ($cartItems as $item): ?>
                  <tr class="cart-table__row"
                    data-cart-item-id="<?= $item['cart_item_id'] ?>"
                    data-price="<?= $item['final_price'] ?>"
                    data-quantity="<?= $item['quantity'] ?>">


                    <td class="cart-table__column cart-table__column--select">
                      <div class="form-check">
                        <input class="form-check-input item-checkbox" type="checkbox" name="selected_items[]"
                          value="<?= $item['cart_item_id'] ?>" id="check<?= $item['cart_item_id'] ?>" required>
                        <label class="form-check-label" for="check<?= $item['cart_item_id'] ?>"></label>
                      </div>
                    </td>

                    <td class="cart-table__column cart-table__column--image">
                      <a href="#"><img src="<?= $item['image_url'] ?>" alt="" /></a>
                    </td>

                    <td class="cart-table__column cart-table__column--product">
                      <a href="#" class="cart-table__product-name"><?= htmlspecialchars($item['name']) ?></a>
                    </td>

                    <td class="cart-table__column cart-table__column--price" data-title="Price">
                      <?= number_format($item['final_price'], 0, ',', '.') ?>₫
                    </td>

                    <td class="cart-table__column cart-table__column--quantity" data-title="Quantity">
                      <div class="custom-qty-box">
                        <button type="button" class="qty-btn decrease" data-cart-item-id="<?= $item['cart_item_id'] ?>">−</button>
                        <input type="text" class="qty-input" value="<?= $item['quantity'] ?>" data-cart-item-id="<?= $item['cart_item_id'] ?>">
                        <button type="button" class="qty-btn increase" data-cart-item-id="<?= $item['cart_item_id'] ?>">+</button>
                      </div>
                    </td>

                    <td class="cart-table__column cart-table__column--total" data-title="Total" data-cart-item-id="<?= $item['cart_item_id'] ?>">
                      <?= number_format($item['total'], 0, ',', '.') ?>₫
                    </td>

                    <td class="cart-table__column cart-table__column--remove">
                      <form method="post" action="remove_from_cart.php">
                        <input type="hidden" name="cart_item_id" value="<?= $item['cart_item_id'] ?>">
                        <button type="submit" class="btn btn-light btn-sm btn-svg-icon">
                          <svg width="12px" height="12px">
                            <use xlink:href="images/sprite.svg#cross-12"></use>
                          </svg>
                        </button>
                      </form>
                    </td>

                  </tr>
                <?php endforeach; ?>

              <?php else: ?>
                <tr>
                  <td colspan="7">Không có sản phẩm nào trong giỏ hàng.</td>
                </tr>
              <?php endif; ?>
            <?php else: ?>
              <tr>
                <td colspan="7">
                  <div class="alert alert-warning text-center">
                    Vui lòng <a href="login.php">đăng nhập</a> để thêm và xem giỏ hàng của bạn.
                  </div>
                </td>
              </tr>
            <?php endif; ?>
          </tbody>
        </table>
        <div class="cart__actions">
          <form class="cart__coupon-form" method="POST" id="coupon-form">
            <input
              type="text"
              class="form-control"
              id="input-coupon-code"
              name="coupon_code"
              placeholder="Nhập mã giảm giá" />
            <button type="button" class="btn btn-primary" id="apply-coupon">Áp dụng</button>
            <div id="discount-message" class="mt-2"></div>
          </form>
        </div>
      </form>
      <?php if (isset($_SESSION['user_id'])): ?>
        <div class="row justify-content-end pt-5">
          <div class="col-12 col-md-7 col-lg-6 col-xl-5">
            <div class="card">
              <div class="card-body">
                <h3 class="card-title">Tổng đơn hàng</h3>
                <table class="cart__totals">
                  <thead class="cart__totals-header">
                    <tr>
                      <th>Tạm tính</th>
                      <td id="subtotal">0 ₫</td>
                    </tr>
                  </thead>
                  <tbody class="cart__totals-body">
                    <tr id="discount-row" style="<?= $appliedDiscount ? '' : 'display:none;' ?>">
                      <th>
                        <?php if ($appliedDiscount): ?>
                          Giảm giá (<?= $appliedDiscount['code'] ?> - <?= $appliedDiscount['discount_percent'] ?>%)
                        <?php else: ?>
                          Giảm giá
                        <?php endif; ?>
                      </th>
                      <td id="discount-amount">0 ₫</td>
                    </tr>
                    <tr>
                      <th>Phí vận chuyển (Dự kiến)</th>
                      <td id="shipping"><?= number_format($shippingFee, 0, ',', '.') ?> ₫</td>
                    </tr>
                  </tbody>

                  <tfoot class="cart__totals-footer">
                    <tr>
                      <th>Tổng cộng</th>
                      <td id="grand-total"><?= number_format($grandTotal, 0, ',', '.') ?> ₫</td>
                    </tr>
                  </tfoot>
                </table>

                <form method="POST" action="checkout.php" id="checkout-form">
                  <button type="submit" class="btn btn-primary btn-block cart__checkout-button" id="proceed-to-checkout">
                    Tiến hành thanh toán
                  </button>
                  <div id="checkout-error-message" class="alert alert-danger mt-3" style="display: none;">
                    Vui lòng chọn ít nhất một sản phẩm để thanh toán.
                  </div>
                </form>

              </div>
            </div>
          </div>
        </div>
      <?php endif; ?>
    </div>
  </div>
</div>

<script>
// Add this script at the end of the file, before the closing PHP include
document.addEventListener('DOMContentLoaded', function() {
  // Update the cart total displays with PHP values
  document.getElementById('subtotal').textContent = '<?= number_format($totalCartPrice, 0, ',', '.') ?> ₫';
  document.getElementById('discount-amount').textContent = '<?= number_format($discountAmount, 0, ',', '.') ?> ₫';
  document.getElementById('shipping').textContent = '<?= number_format($shippingFee, 0, ',', '.') ?> ₫';
  document.getElementById('grand-total').textContent = '<?= number_format($grandTotal, 0, ',', '.') ?> ₫';
});
</script>

<?php include './inc/footer.php'; ?>