const fs = require('fs');

fs.readFile('Task.txt', 'utf8', (err, text) => {
    if (err) {
        console.error("Error reading file:", err);
        return;
    }

    function parseText(text) {
        const questions = [];
        const lines = text.split('\n');
        let question = null;
        let flag;

        lines.forEach(line => {
            if (line.startsWith("Question ID:") || line.startsWith("\\section*{Question ID:")) {
                flag = "question"
                // Start of a new question
                if (question !== null) {
                    if (question["questionText"].endsWith("<br>")) {
                        question["questionText"] = question["questionText"].replace(/<br>\s*$/, "");
                    }
                    if (question["solutionText"].endsWith("<br>")) {
                        question["solutionText"] = question["solutionText"].replace(/<br>\s*$/, "");
                    }
                    questions.push(question);
                }
                question = {
                    "questionNumber": questions.length + 1,
                    "questionId": parseInt(line.split(":")[1].trim()),
                    "questionText": "",
                    "options": [],
                    "solutionText": ""
                };
            } else if (question !== null) {
                if (line.trim() === "") {
                    if (flag === "question" && question["questionText"].length > 0) {
                        question["questionText"] += "<br>";
                    }
                    if (flag === "solution" && question["solutionText"].length > 0) {
                        question["solutionText"] += "<br>";
                    }
                } else if (line.startsWith("(A)") || line.startsWith("(B)") || line.startsWith("(C)") || line.startsWith("(D)")) {
                    // Extract option number and text
                    flag = "option";

                    const optionNumber = line.charCodeAt(1) - 64;
                    const optionText = line.slice(3).trim();
                    const isCorrect = false;
                    question["options"].push({
                        "optionNumber": optionNumber,
                        "optionText": optionText,
                        "isCorrect": isCorrect
                    });
                    if (question["questionText"] === "") {
                        question["questionText"] = " ";
                    }
                } else if (line.startsWith("Answer") || line.startsWith("\\section*{Answer")) {
                    const answer = line.split("(")[1].trim().charAt(0);
                    const index = answer.charCodeAt(0) - 65; // Get the index of the correct option
                    question["options"][index]["isCorrect"] = true; // Set the correct option as true
                } else if (line.startsWith("Sol.")) {
                    flag = "solution";
                    question["solutionText"] = line.slice(5).trim();
                } else if (flag === "solution") {
                    question["solutionText"] += line.trim();
                } else if (flag === "question") {
                    question["questionText"] += line.trim();
                }
            }
        });

        if (question !== null) {
            // Push the last question
            if (question["questionText"].endsWith("<br>")) {
                question["questionText"] = question["questionText"].replace(/<br>\s*$/, "");
                console.log("questionText");
            }
            if (question["solutionText"].endsWith("<br>")) {
                question["solutionText"] = question["solutionText"].replace(/<br>\s*$/, "");
                console.log("solutionText");
            }
            questions.push(question);
        }

        return questions;
    }

    const questions = parseText(text);

    fs.writeFileSync('questions.json', JSON.stringify(questions, null, 2));
});
