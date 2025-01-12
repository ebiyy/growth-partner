// パートナーからのメッセージ集
const partnerMessages = {
	start: [
		"今日も一緒に成長していきましょう！",
		"新しい一日の始まりですね。どんな目標に挑戦しますか？",
		"あなたの成長をサポートできることを嬉しく思います！",
	],
	progress: [
		"その調子です！一歩一歩、確実に前進していますね。",
		"素晴らしい進捗です！この調子で一緒に頑張りましょう。",
		"あなたの努力は必ず実を結びます。共に歩んでいきましょう！",
	],
	completion: [
		"目標達成おめでとうございます！この成長を誇りに思ってください。",
		"素晴らしい成果ですね！次の目標も一緒に目指していきましょう。",
		"一つまた一つと、着実に成長していますね。とても嬉しく思います。",
	],
};

// 目標データを管理するクラス
class GoalManager {
	constructor() {
		this.goals = JSON.parse(localStorage.getItem("goals")) || [];
		this.loadGoals();
	}

	addGoal(text) {
		const goal = {
			id: Date.now(),
			text,
			completed: false,
			progress: 0,
			createdAt: new Date(),
			feedback: this.generateFeedback("start"),
		};
		this.goals.push(goal);
		this.saveGoals();
		this.renderGoals();
		return goal;
	}

	updateProgress(id, progress) {
		const goal = this.goals.find((g) => g.id === id);
		if (goal) {
			goal.progress = progress;
			goal.feedback = this.generateFeedback(
				progress >= 100 ? "completion" : "progress",
			);
			this.saveGoals();
			this.renderGoals();
		}
	}

	toggleComplete(id) {
		const goal = this.goals.find((g) => g.id === id);
		if (goal) {
			goal.completed = !goal.completed;
			goal.progress = goal.completed ? 100 : 0;
			goal.feedback = this.generateFeedback(
				goal.completed ? "completion" : "progress",
			);
			this.saveGoals();
			this.renderGoals();
		}
	}

	generateFeedback(type) {
		const messages = partnerMessages[type];
		return messages[Math.floor(Math.random() * messages.length)];
	}

	saveGoals() {
		localStorage.setItem("goals", JSON.stringify(this.goals));
	}

	loadGoals() {
		this.renderGoals();
		this.updatePartnerMessage();
	}

	renderGoals() {
		const goalsList = document.querySelector(".goals-list");
		const goalsContent = document.createElement("div");
		goalsContent.innerHTML = "<h2>進行中の目標</h2>";

		this.goals.forEach((goal) => {
			goalsContent.innerHTML += `
                <div class="goal-item">
                    <div class="goal-content">
                        <input type="checkbox" id="goal-${goal.id}" 
                            ${goal.completed ? "checked" : ""}
                            onchange="goalManager.toggleComplete(${goal.id})">
                        <label for="goal-${goal.id}">${goal.text}</label>
                    </div>
                    <div class="goal-progress">
                        <div class="progress-bar" style="width: ${goal.progress}%"></div>
                    </div>
                    <div class="partner-feedback">
                        <p>${goal.feedback}</p>
                    </div>
                </div>
            `;
		});

		goalsList.innerHTML = goalsContent.innerHTML;
	}

	updatePartnerMessage() {
		const messageBubble = document.querySelector(".message-bubble");
		const startMessage = this.generateFeedback("start");
		messageBubble.innerHTML = `<p>${startMessage}</p>`;
	}
}

// モチベーショントラッキング
class MotivationTracker {
	constructor() {
		this.history = JSON.parse(localStorage.getItem("motivation")) || [];
		this.setupListeners();
	}

	trackMood(mood) {
		const entry = {
			mood,
			timestamp: new Date(),
		};
		this.history.push(entry);
		localStorage.setItem("motivation", JSON.stringify(this.history));
		this.provideFeedback(mood);
	}

	provideFeedback(mood) {
		const messages = {
			"😊": "素晴らしい！その高いモチベーションで一緒に進んでいきましょう！",
			"🙂": "良い調子ですね。一緒に成長していきましょう！",
			"😐": "お疲れかもしれませんね。無理のないペースで進みましょう。",
			"😔": "今日は少し休憩も大切にしましょう。明日また一緒に頑張りましょう。",
		};

		const messageBubble = document.querySelector(".message-bubble");
		messageBubble.innerHTML = `<p>${messages[mood]}</p>`;
	}

	setupListeners() {
		const moodButtons = document.querySelectorAll(".mood-btn");
		moodButtons.forEach((btn) => {
			btn.addEventListener("click", () => this.trackMood(btn.textContent));
		});
	}
}

// グローバルインスタンスの作成
const goalManager = new GoalManager();
const motivationTracker = new MotivationTracker();

// 目標追加のイベントハンドラ
function addGoal() {
	const input = document.getElementById("goal-input");
	const text = input.value.trim();

	if (text) {
		goalManager.addGoal(text);
		input.value = "";
	}
}

// Enter キーでの目標追加をサポート
document.getElementById("goal-input").addEventListener("keypress", (e) => {
	if (e.key === "Enter") {
		addGoal();
	}
});
