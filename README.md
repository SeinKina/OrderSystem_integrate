# 会計システム

2024年 沖縄高専祭で使用した屋台の会計システム

## スライドURL
https://www.canva.com/design/DAGpBKSUJK8/R5ar31UoPaZQxqW66G_sbw/edit?utm_content=DAGpBKSUJK8&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton


## このアプリで実現したいこと
- 調理待ちの行列の緩和
- 屋台前の待機をなくす
    - 他の出し物を回ることができる

## 使用の流れ
### お客さん側
1. 会計ブースで支払いを済ませる(整理番号を発行)
2. LINE BOTで整理番号を使い、注文連携する
3. 調理が完了すると通知が来る


### 会計側
1. 商品を選択
2. 注文する
3. 各屋台に注文された商品が表示される


### 屋台側
1. 注文された商品が表示(リアルタイム)
2. 調理完了すると注文のステータスを変更(調理完了)
3. 2番と同時にお客さんに調理完了の通知
4. お客さんへ商品の受け渡しが完了すると注文のステータスを変更(受け取り済み)


## 使用した技術
  <img src="https://drive.google.com/file/d/1JFLVWWrDFSaBq4YSPAz5KgUYu2FKpdm8/view?usp=sharing" width="300" height="200">