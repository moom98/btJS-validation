function AppModel(attrs) {
  this.val = "";

  // バリデーションのルールを設定する
  this.attrs = {
    required: "",
    maxlength: 8,
    minlength: 4,
  }

  // バリデーションの結果を格納する配列を初期化する
  // オブザーバー
  this.listeners = {
    valid: [],
    invalid: []
  };
}

// オブザーバーを登録する
AppModel.prototype.on = function (event, func) {
  // オブザーバーを格納する配列が存在しない場合は初期化する
  this.listeners[event].push(func);
};

// オブザーバーを実行する
AppModel.prototype.trigger = function (event) {
  // オブザーバーを格納する配列をループで回す
  $.each(this.listeners[event], function () {
    this();
  });
};

AppModel.prototype.set = function (val) {
  // valとthis.valを比較し、変化がなければ何もしない
  if (this.val === val) return;

  // 変化があった場合はvalを更新する
  this.val = val;
  this.validate();
}


// 値が空かどうかを判定する
AppModel.prototype.required = function () {
  return this.val !== "";
}

// 値の長さがnum以下かどうかを判定する
AppModel.prototype.maxlength = function (num) {
  return num >= this.val.length;
}

// 値の長さがnum以上かどうかを判定する
AppModel.prototype.minlength = function (num) {
  return num <= this.val.length;
}



AppModel.prototype.validate = function () {
  let val;
  // エラーを格納する配列を初期化する
  this.errors = [];

  // バリデーションのルールをループで回す
  for (let key in this.attrs) {
    // ルールのkey名に対応する値を取得する
    val = this.attrs[key];

    // ルールのkey名に対応するメソッドが存在するかを確認し、
    // 存在しなければ次のルールへ
    if (!this[key](val)) {
      // メソッドが存在する場合は、エラーを格納する
      this.errors.push(key);
    }
  }

  // オブザーバーを実行する
  // エラーがなければvalid、エラーがあればinvalidを実行する
  this.trigger(!this.errors.length ? "valid" : "invalid");
}


function AppView(el) {
  // elはDOM要素
  this.initialize(el);

  // インスタンス化したときにイベントを登録する
  this.handleEvents();
}

AppView.prototype.initialize = function (el) {
  // DOM要素をプロパティに格納する
  this.$el = $(el);
  // this.elの次の要素をプロパティに格納する
  this.$list = this.$el.next().children();

  // モデルを生成する
  // data属性を取得し、モデルの初期値とする
  let obj = this.$el.data();

  // required属性がある場合は、objにrequiredプロパティを追加する
  if (this.$el.prop("required")) {
    obj["required"] = "";
  }

  // AppModelにobjを渡してインスタンスを生成する
  // [this.model]を通して、AppModelのプロパティやメソッドにアクセスできる
  this.model = new AppModel(obj);
}

// DOMイベントを登録する
AppView.prototype.handleEvents = function () {
  let self = this;

  // keyupイベントのイベントハンドラにonKeyupを登録する
  this.$el.on("keyup change", function (e) {
    self.onKeyup(e);
  });

  // valid,invalidイベントに対してイベントハンドラを登録する
  this.model.on("valid", function () {
    self.onValid();
  });

  this.model.on("invalid", function () {
    self.onInvalid();
  });

}

// onKeyupメソッドを定義する
AppView.prototype.onKeyup = function (e) {
  // 入力値を取得する
  let val = $(e.currentTarget).val();

  // モデルに入力値をセットする
  this.model.set(val);
}

// onValidメソッドを定義する
AppView.prototype.onValid = function () {
  // エラー表示を削除する
  this.$el.removeClass("error");
  this.$list.hide();
}

// onInvalidメソッドを定義する
AppView.prototype.onInvalid = function () {
  let self = this;

  // エラー表示を追加する
  this.$el.addClass("error");
  this.$list.hide();

  // エラーメッセージを追加する
  // モデルのエラー配列をループで回す
  $.each(this.model.errors, function (index, val) {
    // 該当したエラーだけに対応するメッセージを表示する
    // [data-error=""]の中にエラーに対応するメッセージが入っている
    self.$list.filter("[data-error=\"" + val + "\"]").show();
  });
}

$("input").each(function () {
  new AppView(this);
});