import type { Locale } from "./locale";

/**
 * Flat message catalogue. Keeping one typed object per locale makes missing
 * translations a compile-time error rather than a runtime surprise.
 */
export const en = {
  "meta.title": "Blind Chess — you only see your own pieces",
  "meta.description":
    "A fog-of-war chess game. Your opponent's army moves as anonymous shadows; only a checking piece reveals its identity. Play the engine or invite a friend with a six-character room code.",

  "common.close": "Close",
  "common.home": "Blind Chess home",
  "common.white": "White",
  "common.black": "Black",
  "common.you": "You",
  "common.language": "Language",
  "common.switchToRussian": "Switch to Russian",
  "common.switchToEnglish": "Switch to English",

  "brand.subtitle": "fog of war",

  "start.eyebrow": "Fog-of-war chess",
  "start.heroLine1": "You can see your army.",
  "start.heroLine2": "Nothing else.",
  "start.heroDescription":
    "Your opponent's pieces are anonymous shadows. You can see where they stand, never what they are — until one of them gives check. Read the board, count the captures, and hunt a king you cannot name.",
  "start.howItWorks": "How it works",
  "start.multiplayer": "Multiplayer",
  "start.playEngine": "Play the engine",
  "start.clock": "Clock",
  "start.youAreWhite": "you are white",
  "start.difficulty": "Difficulty",
  "start.startSolo": "Start a solo game",
  "start.playFriend": "Play a friend",
  "start.joinWithCodeAria": "Join a room with a code",
  "start.engineFullSight":
    "The engine plays with full sight; you do not. Rooms are six-character codes with no account required.",
  "start.statPiecesHidden": "pieces hidden",
  "start.statCharacterRooms": "character rooms",
  "start.statFogUntilCheck": "fog, until check",
  "start.enemyWatching": "16 enemy pieces are watching",
  "start.whiteToMove": "white to move",
  "start.rulesTitle": "Three rules of the fog",
  "start.rulesDescription":
    "Everything else is standard chess: castling, en passant, promotion, checks and mates.",
  "start.ruleOwnTitle": "Only your army",
  "start.ruleOwnBody":
    "Your pieces stand in full detail. Their army is a field of identical shadows: you always know where they are, never what they are.",
  "start.ruleCheckTitle": "Check turns on the lights",
  "start.ruleCheckBody":
    "The moment a hidden piece gives check, it appears. Resolve the check and it slips back into the fog.",
  "start.ruleMemoryTitle": "A memory game at heart",
  "start.ruleMemoryBody":
    "Their moves read as ???. A check reveals the attacker; a capture reveals only what was taken. Reconstruct the rest.",
  "start.ctaTitle": "Ready to lose sight of things?",
  "start.ctaBody": "One board, two views, no mercy on your memory.",
  "start.playNow": "Play now",
  "start.footerTagline": "Blind Chess — the fog is the point.",

  "game.practice": "Practice · {level}",
  "game.copyRoomCode": "Copy room code",
  "game.invite": "Invite",
  "game.muteSounds": "Mute sounds",
  "game.enableSounds": "Enable sounds",
  "game.leaveRoom": "Leave room",
  "game.backToStart": "Back to start",
  "game.inviteFriend": "Invite a friend",
  "game.engine": "The Engine",
  "game.hiddenOpponent": "Hidden opponent",
  "game.opponentNote": "{level} · Black",
  "game.viewerNoteWhite": "White",
  "game.viewerNoteBlack": "Black",
  "game.waitingJoin": "Waiting for your opponent to join",
  "game.opponentReconnecting": "Opponent reconnecting — the board is paused",
  "game.awaitingHost": "Waiting for the host to confirm your move…",
  "game.boardFooter":
    "Your pieces and any active checking attackers are drawn in full. Other enemy pieces are anonymous shadows; a capture identifies the taken piece in the log and captured tracker.",
  "game.boardFooterSecond":
    "Gold is your last move; blue is theirs. A red ! marks a move that would leave your king in check.",
  "game.resignTitle": "Resign this game?",
  "game.resignDescription":
    "The fog lifts for nobody. Your opponent takes the win and the result is final.",
  "game.keepPlaying": "Keep playing",
  "game.resign": "Resign",

  "player.noCapturesYet": "no captures yet",
  "player.thinking": "thinking…",
  "player.clockAria": "{name} clock",

  "captured.title": "Captured",
  "captured.hint": "deduce what is left",
  "captured.youTook": "You took",
  "captured.theyTook": "They took",
  "captured.nothingYet": "Nothing yet",
  "captured.footer":
    "Every capture is public. Use the totals to count the pieces still hidden.",

  "moveLog.title": "Memory log",
  "moveLog.hint": "Plies: {count}",
  "moveLog.howAria": "How the move log works",
  "moveLog.tooltip":
    "Your moves are written out. Their moves stay hidden as ??? unless they give check — then the attacking piece is revealed. A capture identifies only the captured piece. Their latest move is marked on the board.",
  "moveLog.noMoves": "No moves yet.",
  "moveLog.fogIntact": "The fog is intact.",
  "moveLog.hiddenMove": "Hidden move",
  "moveLog.capturedSuffix": " — captured {piece}",
  "moveLog.moveTitle": "{color} {san}{captured}",
  "moveLog.capturedAria": "Captured {piece}",
  "moveLog.footerPrefix": "???",
  "moveLog.footerBody":
    " is a hidden move. Their latest move is marked on the board; a check reveals the attacker, and a capture reveals only what was taken.",

  "status.tableStatus": "Table status",
  "status.result": "Result",
  "status.live": "Live",
  "status.final": "Final",
  "status.yourMove": "Your move",
  "status.yourMoveDetail":
    "Your pieces are drawn in full. Other enemy pieces are shadows until they give check.",
  "status.checkmateWin": "Checkmate — you win",
  "status.checkmate": "Checkmate",
  "status.checkmateWinDetail":
    "You found the hidden king. The fog lifts at dawn.",
  "status.checkmateLoseDetail": "Your king had nowhere left to go.",
  "status.draw": "A draw in the fog",
  "status.youWin": "You win",
  "status.youResigned": "You resigned",
  "status.youWinOnTime": "You win on time",
  "status.timeRanOut": "Time ran out",
  "status.gameAbandoned": "Game abandoned",
  "status.roomClosed": "The room was closed before the game finished.",
  "status.waitingChallenger": "Waiting for a challenger",
  "status.shareRoomDetail":
    "Share the room code below — the board unlocks when they arrive.",
  "status.opponentDisconnected": "Opponent disconnected",
  "status.reconnectDetail":
    "The room is still open. Play resumes when they reconnect.",
  "status.engineThinking": "The engine is thinking",
  "status.engineThinkingDetail":
    "Your last move disappeared into the fog. It is calculating.",
  "status.checkTitle": "Check — a piece revealed",
  "status.checkDetail":
    "The attacker is visible until the check is resolved. Then it disappears again.",
  "status.theirMove": "Their move",
  "status.theirMoveDetail":
    "Watch the log, remember the shape of the board, and wait.",
  "status.piecesInFog": "Pieces in the fog: {count}",
  "status.moves": "Moves: {count}",
  "status.plies": "Plies: {count}",
  "status.roomRelay": "room relay",
  "status.localRelay": "local relay",
  "status.shareRoom": "Share room {code}",
  "status.waitingReturn": "Waiting for them to return…",
  "status.liftFog": "Lift the fog",
  "status.fogLifted": "Fog lifted",
  "status.relayUnavailable": "Relay unavailable. Check your connection.",

  "end.checkmate": "{color} wins by checkmate",
  "end.resignation": "{color} wins by resignation",
  "end.timeout": "{color} wins on time",
  "end.stalemate": "Draw by stalemate",
  "end.insufficient": "Draw — insufficient material",
  "end.threefold": "Draw by threefold repetition",
  "end.fiftyMove": "Draw by the fifty-move rule",
  "end.abandoned": "Game abandoned",
  "end.gameOver": "Game over",
  "end.checkmatePlain": "Checkmate",

  "gameOver.draw": "A draw in the fog",
  "gameOver.youWin": "You win",
  "gameOver.youLose": "You lose",
  "gameOver.summary": "{reason} · Plies played: {count}.",
  "gameOver.closedBy": "{color} closed the game",
  "gameOver.neither": "Neither side",
  "gameOver.opponentPresent": "Opponent present",
  "gameOver.opponentOffline": "Opponent offline",
  "gameOver.fogNote":
    "The fog is still down. Lift it to see the board your opponent was hiding — or start again and keep your deductions to yourself.",
  "gameOver.requestRematch": "Request rematch",
  "gameOver.rematch": "Rematch",
  "gameOver.opponentOfflineTitle": "Your opponent is offline",

  "newGame.title": "New game",
  "newGame.description": "Set the table. The fog returns either way.",
  "newGame.opponent": "Opponent",
  "newGame.vsComputer": "vs Computer",
  "newGame.vsFriend": "vs Friend",
  "newGame.difficulty": "Difficulty",
  "newGame.aiBlurbSuffix":
    "The engine sees the whole board; local play is a memory battle.",
  "newGame.onlineInfo":
    "You will get a six-character room code and a share link. You play White and the board unlocks when your friend joins.",
  "newGame.clock": "Clock",
  "newGame.youWhiteEngineBlack": "You are White. The engine is Black.",
  "newGame.creatorWhiteJoinerBlack": "Creator is White. Joiner is Black.",
  "newGame.cancel": "Cancel",
  "newGame.start": "Start game",
  "newGame.createRoom": "Create room",

  "difficulty.easy": "Easy",
  "difficulty.medium": "Medium",
  "difficulty.hard": "Hard",
  "difficulty.depth1": "depth 1",
  "difficulty.depth2": "depth 2",
  "difficulty.depth3": "depth 3+",
  "difficulty.easyBlurb": "Plays fast and leaves pieces hanging.",
  "difficulty.mediumBlurb": "Sees simple captures and threats.",
  "difficulty.hardBlurb": "Searches deeper and rarely gifts material.",

  "piece.pawn": "Pawn",
  "piece.knight": "Knight",
  "piece.bishop": "Bishop",
  "piece.rook": "Rook",
  "piece.queen": "Queen",
  "piece.king": "King",

  "time.noClock": "No clock",

  "promotion.title": "Promote your pawn",
  "promotion.description":
    "A pawn reached the last rank. Choose what it becomes — the choice is permanent.",
  "promotion.cancel": "Cancel this move",

  "waiting.forHost": "Waiting for the host",
  "waiting.forOpponent": "Waiting for the opponent",
  "waiting.guestDetail":
    "The host is setting the table. The board will unlock the moment the room syncs.",
  "waiting.hostDetail":
    "Share the code below. Play starts as soon as someone joins.",
  "waiting.copyInviteAria": "Copy invite link",
  "waiting.youPlayBlack": "You will play Black",
  "waiting.youPlayWhite": "You will play White",
  "waiting.relayError":
    "The relay is unreachable. Check your connection and refresh.",
  "waiting.localNote":
    "This build is using the local relay. Open the invite link in a second tab to test the room, or configure Pusher for cross-device play.",
  "waiting.leaveRoom": "Leave room",

  "room.opening": "Opening the room…",
  "room.invalidTitle": "That room is not a room",
  "room.invalidDescription":
    "Room codes are six characters. Ask your opponent for their invite bar and try again.",
  "room.backToStart": "Back to the start",
  "room.title": "Play a friend",
  "room.description":
    "A six-character room. No account, no download — just a shared board and two very different views of it.",
  "room.tabInvite": "Invite",
  "room.tabJoinAnother": "Join another",
  "room.tabCreate": "Create a room",
  "room.tabJoin": "Join with a code",
  "room.clock": "Clock",
  "room.createInfo":
    "You play White. Send the link to your friend — the board unlocks the moment they arrive. The creator keeps the authoritative game state.",
  "room.create": "Create room",
  "room.localRelayActive":
    "Local relay active: rooms work between tabs on this browser. Add Pusher keys to play across devices.",
  "room.roomCode": "Room code",
  "room.joinInfo":
    "Ask your opponent for the six characters from their invite bar. You will play Black.",
  "room.join": "Join room",
  "room.shareLink": "Share link",
  "room.copyCode": "Copy code",
  "room.share": "Share",
  "room.shareText": "Join my Blind Chess room. The code is {code}.",
  "room.localRelayBuild":
    "This build uses a local browser relay. Open the invite link in a second tab to test the room; configure Pusher for cross-device play.",

  "controls.title": "Controls",
  "controls.newGame": "New game",
  "controls.flip": "Flip board",
  "controls.soundOn": "Sound on",
  "controls.muted": "Muted",
  "controls.resign": "Resign",
  "controls.hint":
    "Switch mode, difficulty or clock when you start a new game.",
  "controls.invite": "Invite · {code}",

  "board.aria": "Fog of war chess board",
  "board.whitePiece": "White piece: {piece} on {square}",
  "board.blackPiece": "Black piece: {piece} on {square}",
  "board.hidden": "Hidden enemy piece on {square}",
  "board.empty": "Empty square {square}",
  "board.danger": " — moving here would expose your king",
  "board.opponentLast": " — opponent's last move",

  "toast.roomCodeCopied": "Room code copied",
  "toast.couldNotCopyCode": "Could not copy the code",
  "toast.couldNotCopyInvite": "Could not copy the invite link",
  "toast.inviteLinkCopied": "Invite link copied",
  "toast.couldNotCopyClipboard": "Could not copy to the clipboard",
  "toast.copied": "{label} copied",
  "toast.enterRoomCode": "Enter a six-character room code",

  "label.inviteLink": "Invite link",
  "label.roomCode": "Room code",

  "errors.gameOver": "The game is already over.",
  "errors.notYourTurn": "It is not your turn.",
  "errors.sameSquare": "Pick a different square.",
  "errors.emptySquare": "There is no piece on that square.",
  "errors.notYourPiece": "That piece is not yours.",
  "errors.pieceInWay": "A piece is in the way.",
  "errors.invisibleObstacle": "Path blocked by an invisible obstacle!",
  "errors.inCheck": "You must get out of check first.",
  "errors.illegal": "That move isn’t allowed.",
  "errors.waitingOpponent": "Waiting for your opponent to join.",
  "errors.kingExposed": "That move would leave your king in check.",
  "errors.relayUnreachable": "Could not reach the room relay.",
  "errors.hostNoAnswer": "The host did not answer. Try your move again.",
} as const;

export type MessageKey = keyof typeof en;

export const ru: Record<MessageKey, string> = {
  "meta.title": "Blind Chess — вы видите только свои фигуры",
  "meta.description":
    "Шахматы в тумане войны. Армия соперника движется как безымянные тени; лишь фигура, объявившая шах, раскрывает себя. Играйте с движком или пригласите друга по шестизначному коду комнаты.",

  "common.close": "Закрыть",
  "common.home": "Главная Blind Chess",
  "common.white": "Белые",
  "common.black": "Чёрные",
  "common.you": "Вы",
  "common.language": "Язык",
  "common.switchToRussian": "Переключить на русский",
  "common.switchToEnglish": "Переключить на английский",

  "brand.subtitle": "туман войны",

  "start.eyebrow": "Шахматы в тумане войны",
  "start.heroLine1": "Вы видите свою армию.",
  "start.heroLine2": "И больше ничего.",
  "start.heroDescription":
    "Фигуры соперника — безымянные тени. Вы видите, где они стоят, но не знаете, что это за фигуры, пока одна из них не объявит шах. Читайте доску, считайте взятия и охотьтесь на короля, которого не можете назвать.",
  "start.howItWorks": "Как это работает",
  "start.multiplayer": "Сетевая игра",
  "start.playEngine": "Игра с движком",
  "start.clock": "Время",
  "start.youAreWhite": "вы играете белыми",
  "start.difficulty": "Сложность",
  "start.startSolo": "Начать одиночную игру",
  "start.playFriend": "Игра с другом",
  "start.joinWithCodeAria": "Войти в комнату по коду",
  "start.engineFullSight":
    "Движок видит всю доску, вы — нет. Комнаты используют шестизначные коды и не требуют аккаунта.",
  "start.statPiecesHidden": "фигур скрыто",
  "start.statCharacterRooms": "символов в коде",
  "start.statFogUntilCheck": "туман до шаха",
  "start.enemyWatching": "16 фигур соперника следят за вами",
  "start.whiteToMove": "ход белых",
  "start.rulesTitle": "Три правила тумана",
  "start.rulesDescription":
    "Всё остальное — обычные шахматы: рокировка, взятие на проходе, превращение, шахи и маты.",
  "start.ruleOwnTitle": "Только своя армия",
  "start.ruleOwnBody":
    "Ваши фигуры видны полностью. Армия соперника — поле одинаковых теней: вы всегда знаете, где они, но не кто они.",
  "start.ruleCheckTitle": "Шах включает свет",
  "start.ruleCheckBody":
    "Как только скрытая фигура объявляет шах, она появляется. Устраните шах — и она снова уйдёт в туман.",
  "start.ruleMemoryTitle": "В душе — игра на память",
  "start.ruleMemoryBody":
    "Их ходы выглядят как ???. Шах раскрывает атакующую фигуру, взятие — только то, что было взято. Остальное восстановите сами.",
  "start.ctaTitle": "Готовы сыграть вслепую?",
  "start.ctaBody":
    "Одна доска, два взгляда и никакой пощады к вашей памяти.",
  "start.playNow": "Играть",
  "start.footerTagline": "Blind Chess — весь смысл в тумане.",

  "game.practice": "Тренировка · {level}",
  "game.copyRoomCode": "Скопировать код комнаты",
  "game.invite": "Пригласить",
  "game.muteSounds": "Выключить звук",
  "game.enableSounds": "Включить звук",
  "game.leaveRoom": "Выйти из комнаты",
  "game.backToStart": "На главную",
  "game.inviteFriend": "Пригласить друга",
  "game.engine": "Движок",
  "game.hiddenOpponent": "Скрытый соперник",
  "game.opponentNote": "{level} · Чёрные",
  "game.viewerNoteWhite": "Белые",
  "game.viewerNoteBlack": "Чёрные",
  "game.waitingJoin": "Ждём, когда соперник присоединится",
  "game.opponentReconnecting":
    "Соперник переподключается — доска на паузе",
  "game.awaitingHost": "Ждём подтверждения вашего хода организатором…",
  "game.boardFooter":
    "Ваши фигуры и активные атакующие, объявившие шах, видны полностью. Остальные фигуры соперника — безымянные тени; взятие раскрывает взятую фигуру в журнале и списке взятых.",
  "game.boardFooterSecond":
    "Золотой — ваш последний ход, синий — ход соперника. Красный ! отмечает ход, который оставит вашего короля под шахом.",
  "game.resignTitle": "Сдаться в этой игре?",
  "game.resignDescription":
    "Туман не рассеется ни для кого. Соперник получает победу, результат окончательный.",
  "game.keepPlaying": "Продолжить игру",
  "game.resign": "Сдаться",

  "player.noCapturesYet": "взятий пока нет",
  "player.thinking": "думает…",
  "player.clockAria": "Часы: {name}",

  "captured.title": "Взятые фигуры",
  "captured.hint": "вычислите, что осталось",
  "captured.youTook": "Вы взяли",
  "captured.theyTook": "У вас взяли",
  "captured.nothingYet": "Пока ничего",
  "captured.footer":
    "Каждое взятие открыто. По итогам считайте, сколько фигур ещё скрыто.",

  "moveLog.title": "Журнал памяти",
  "moveLog.hint": "Полуходов: {count}",
  "moveLog.howAria": "Как работает журнал ходов",
  "moveLog.tooltip":
    "Ваши ходы записываются полностью. Ходы соперника скрыты как ???, если они не объявляют шах — тогда атакующая фигура раскрывается. Взятие раскрывает только взятую фигуру. Последний ход соперника отмечен на доске.",
  "moveLog.noMoves": "Ходов пока нет.",
  "moveLog.fogIntact": "Туман не тронут.",
  "moveLog.hiddenMove": "Скрытый ход",
  "moveLog.capturedSuffix": " — взято: {piece}",
  "moveLog.moveTitle": "{color} {san}{captured}",
  "moveLog.capturedAria": "Взята фигура: {piece}",
  "moveLog.footerPrefix": "???",
  "moveLog.footerBody":
    " — скрытый ход. Последний ход соперника отмечен на доске; шах раскрывает атакующего, а взятие — только взятую фигуру.",

  "status.tableStatus": "Статус стола",
  "status.result": "Результат",
  "status.live": "Идёт игра",
  "status.final": "Итог",
  "status.yourMove": "Ваш ход",
  "status.yourMoveDetail":
    "Ваши фигуры видны полностью. Остальные фигуры соперника — тени, пока не объявят шах.",
  "status.checkmateWin": "Мат — вы победили",
  "status.checkmate": "Мат",
  "status.checkmateWinDetail":
    "Вы нашли скрытого короля. Туман рассеивается на рассвете.",
  "status.checkmateLoseDetail": "Вашему королю некуда было идти.",
  "status.draw": "Ничья в тумане",
  "status.youWin": "Вы победили",
  "status.youResigned": "Вы сдались",
  "status.youWinOnTime": "Вы победили по времени",
  "status.timeRanOut": "Время вышло",
  "status.gameAbandoned": "Игра прервана",
  "status.roomClosed": "Комната закрылась до конца игры.",
  "status.waitingChallenger": "Ждём соперника",
  "status.shareRoomDetail":
    "Поделитесь кодом комнаты ниже — доска откроется, когда соперник придёт.",
  "status.opponentDisconnected": "Соперник отключился",
  "status.reconnectDetail":
    "Комната ещё открыта. Игра продолжится, когда соперник вернётся.",
  "status.engineThinking": "Движок думает",
  "status.engineThinkingDetail":
    "Ваш последний ход исчез в тумане. Движок считает.",
  "status.checkTitle": "Шах — фигура раскрыта",
  "status.checkDetail":
    "Атакующая фигура видна, пока шах не устранён. Затем она снова исчезнет.",
  "status.theirMove": "Ход соперника",
  "status.theirMoveDetail":
    "Следите за журналом, запоминайте доску и ждите.",
  "status.piecesInFog": "Фигур в тумане: {count}",
  "status.moves": "Ходов: {count}",
  "status.plies": "Полуходов: {count}",
  "status.roomRelay": "релей комнаты",
  "status.localRelay": "локальный релей",
  "status.shareRoom": "Поделиться комнатой {code}",
  "status.waitingReturn": "Ждём возвращения соперника…",
  "status.liftFog": "Развеять туман",
  "status.fogLifted": "Туман рассеян",
  "status.relayUnavailable": "Релей недоступен. Проверьте соединение.",

  "end.checkmate": "{color} побеждают матом",
  "end.resignation": "{color} побеждают после сдачи соперника",
  "end.timeout": "{color} побеждают по времени",
  "end.stalemate": "Ничья из-за пата",
  "end.insufficient": "Ничья — недостаточно материала",
  "end.threefold": "Ничья из-за троекратного повторения",
  "end.fiftyMove": "Ничья по правилу пятидесяти ходов",
  "end.abandoned": "Игра прервана",
  "end.gameOver": "Игра окончена",
  "end.checkmatePlain": "Мат",

  "gameOver.draw": "Ничья в тумане",
  "gameOver.youWin": "Вы победили",
  "gameOver.youLose": "Вы проиграли",
  "gameOver.summary": "{reason} · Полуходов: {count}.",
  "gameOver.closedBy": "{color} завершили игру",
  "gameOver.neither": "Ни одна сторона",
  "gameOver.opponentPresent": "Соперник на связи",
  "gameOver.opponentOffline": "Соперник не в сети",
  "gameOver.fogNote":
    "Туман всё ещё опущен. Развейте его, чтобы увидеть доску, которую скрывал соперник, — или начните заново и оставьте свои выводы при себе.",
  "gameOver.requestRematch": "Предложить реванш",
  "gameOver.rematch": "Реванш",
  "gameOver.opponentOfflineTitle": "Соперник не в сети",

  "newGame.title": "Новая игра",
  "newGame.description": "Накройте стол. Туман вернётся в любом случае.",
  "newGame.opponent": "Соперник",
  "newGame.vsComputer": "Против компьютера",
  "newGame.vsFriend": "Против друга",
  "newGame.difficulty": "Сложность",
  "newGame.aiBlurbSuffix":
    "Движок видит всю доску; игра с ним — битва памяти.",
  "newGame.onlineInfo":
    "Вы получите шестизначный код комнаты и ссылку. Вы играете белыми; доска откроется, когда друг присоединится.",
  "newGame.clock": "Время",
  "newGame.youWhiteEngineBlack": "Вы играете белыми. Движок — чёрными.",
  "newGame.creatorWhiteJoinerBlack":
    "Создатель играет белыми. Присоединившийся — чёрными.",
  "newGame.cancel": "Отмена",
  "newGame.start": "Начать игру",
  "newGame.createRoom": "Создать комнату",

  "difficulty.easy": "Лёгкая",
  "difficulty.medium": "Средняя",
  "difficulty.hard": "Сложная",
  "difficulty.depth1": "глубина 1",
  "difficulty.depth2": "глубина 2",
  "difficulty.depth3": "глубина 3+",
  "difficulty.easyBlurb": "Играет быстро и оставляет фигуры без защиты.",
  "difficulty.mediumBlurb": "Видит простые взятия и угрозы.",
  "difficulty.hardBlurb": "Считает глубже и редко дарит материал.",

  "piece.pawn": "Пешка",
  "piece.knight": "Конь",
  "piece.bishop": "Слон",
  "piece.rook": "Ладья",
  "piece.queen": "Ферзь",
  "piece.king": "Король",

  "time.noClock": "Без часов",

  "promotion.title": "Превратите пешку",
  "promotion.description":
    "Пешка дошла до последней горизонтали. Выберите, во что она превратится, — выбор окончательный.",
  "promotion.cancel": "Отменить ход",

  "waiting.forHost": "Ждём организатора",
  "waiting.forOpponent": "Ждём соперника",
  "waiting.guestDetail":
    "Организатор накрывает стол. Доска откроется, как только комната синхронизируется.",
  "waiting.hostDetail":
    "Поделитесь кодом ниже. Игра начнётся, как только кто-то присоединится.",
  "waiting.copyInviteAria": "Скопировать ссылку-приглашение",
  "waiting.youPlayBlack": "Вы играете чёрными",
  "waiting.youPlayWhite": "Вы играете белыми",
  "waiting.relayError":
    "Релей недоступен. Проверьте соединение и обновите страницу.",
  "waiting.localNote":
    "Эта сборка использует локальный релей. Откройте ссылку-приглашение во второй вкладке или настройте Pusher для игры между устройствами.",
  "waiting.leaveRoom": "Выйти из комнаты",

  "room.opening": "Открываем комнату…",
  "room.invalidTitle": "Такой комнаты нет",
  "room.invalidDescription":
    "Код комнаты состоит из шести символов. Попросите у соперника код и попробуйте снова.",
  "room.backToStart": "На главную",
  "room.title": "Игра с другом",
  "room.description":
    "Комната с шестизначным кодом. Без аккаунта и загрузок — общая доска и два очень разных взгляда на неё.",
  "room.tabInvite": "Приглашение",
  "room.tabJoinAnother": "Присоединиться",
  "room.tabCreate": "Создать комнату",
  "room.tabJoin": "Войти по коду",
  "room.clock": "Время",
  "room.createInfo":
    "Вы играете белыми. Отправьте ссылку другу — доска откроется, как только он присоединится. Создатель хранит основное состояние игры.",
  "room.create": "Создать комнату",
  "room.localRelayActive":
    "Активен локальный релей: комнаты работают между вкладками этого браузера. Добавьте ключи Pusher для игры между устройствами.",
  "room.roomCode": "Код комнаты",
  "room.joinInfo":
    "Попросите у соперника шесть символов из его панели приглашения. Вы играете чёрными.",
  "room.join": "Войти в комнату",
  "room.shareLink": "Ссылка для приглашения",
  "room.copyCode": "Скопировать код",
  "room.share": "Поделиться",
  "room.shareText": "Присоединяйтесь к моей комнате Blind Chess. Код: {code}.",
  "room.localRelayBuild":
    "Эта сборка использует локальный релей браузера. Откройте ссылку во второй вкладке или настройте Pusher для игры между устройствами.",

  "controls.title": "Управление",
  "controls.newGame": "Новая игра",
  "controls.flip": "Перевернуть доску",
  "controls.soundOn": "Звук включён",
  "controls.muted": "Без звука",
  "controls.resign": "Сдаться",
  "controls.hint":
    "Режим, сложность и время можно изменить при новой игре.",
  "controls.invite": "Пригласить · {code}",

  "board.aria": "Шахматная доска в тумане войны",
  "board.whitePiece": "Белая фигура: {piece} на {square}",
  "board.blackPiece": "Чёрная фигура: {piece} на {square}",
  "board.hidden": "Скрытая фигура соперника на {square}",
  "board.empty": "Пустая клетка {square}",
  "board.danger": " — ход сюда откроет вашего короля",
  "board.opponentLast": " — последний ход соперника",

  "toast.roomCodeCopied": "Код комнаты скопирован",
  "toast.couldNotCopyCode": "Не удалось скопировать код",
  "toast.couldNotCopyInvite": "Не удалось скопировать ссылку-приглашение",
  "toast.inviteLinkCopied": "Ссылка-приглашение скопирована",
  "toast.couldNotCopyClipboard": "Не удалось скопировать в буфер обмена",
  "toast.copied": "{label} скопировано",
  "toast.enterRoomCode": "Введите шестизначный код комнаты",

  "label.inviteLink": "Ссылка-приглашение",
  "label.roomCode": "Код комнаты",

  "errors.gameOver": "Игра уже окончена.",
  "errors.notYourTurn": "Сейчас не ваш ход.",
  "errors.sameSquare": "Выберите другую клетку.",
  "errors.emptySquare": "На этой клетке нет фигуры.",
  "errors.notYourPiece": "Это не ваша фигура.",
  "errors.pieceInWay": "На пути стоит фигура.",
  "errors.invisibleObstacle": "Путь заблокирован невидимым препятствием!",
  "errors.inCheck": "Сначала нужно выйти из-под шаха.",
  "errors.illegal": "Такой ход невозможен.",
  "errors.waitingOpponent": "Ждём, когда соперник присоединится.",
  "errors.kingExposed": "Этот ход оставит вашего короля под шахом.",
  "errors.relayUnreachable": "Не удалось связаться с релеем комнаты.",
  "errors.hostNoAnswer":
    "Организатор не ответил. Попробуйте сделать ход ещё раз.",
};

export const dictionaries: Record<Locale, Record<MessageKey, string>> = {
  en,
  ru,
};

export function translate(
  locale: Locale,
  key: MessageKey,
  params?: Record<string, string | number>,
): string {
  const template = dictionaries[locale][key] ?? en[key];
  if (!params) return template;

  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = params[name];
    return value === undefined ? match : String(value);
  });
}
