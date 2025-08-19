import google.generativeai as genai
import os

# --- 組態設定 ---
# 為了安全，建議將您的 API 金鑰儲存為環境變數。
# 執行前，請在您的終端機中設定：
# export GOOGLE_API_KEY="YOUR_API_KEY"
try:
    genai.configure(api_key=os.environ["GOOGLE_API_KEY"])
except KeyError:
    print("錯誤：尚未設定 GOOGLE_API_KEY 環境變數。")
    print("請將其設定為您的 Google API 金鑰。")
    exit()

# --- 模型初始化 (使用更新後的模型名稱) ---
model = genai.GenerativeModel('gemini-2.5-flash')

def read_prompt_from_file(file_path):
    """從指定的檔案讀取提示文字。"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        return f"錯誤：在 {file_path} 找不到提示檔案"
    except Exception as e:
        return f"讀取檔案時發生錯誤：{e}"

def get_gemini_response(prompt_text):

    """
    傳送一個提示到 Gemini API 並回傳模型的答覆。

    Args:
      prompt_text: 您想要傳送給模型的提示文字。

    Returns:
      來自模型的文字回覆。
    """
    if "錯誤：" in prompt_text:
        return prompt_text
    try:
        response = model.generate_content(prompt_text)
        return response.text
    except Exception as e:
        return f"呼叫 Gemini API 時發生錯誤：{e}"

# --- 主要執行區 ---
if __name__ == "__main__":
    # 此腳本將會從相同目錄下的 'prompt.md' 載入提示。
    prompt_file = "prompt.md"

    print(f"正在從 '{prompt_file}' 載入提示...")

    # 這是「載入」的過程。
    # 每次執行腳本時，它都會讀取檔案的目前內容。
    my_prompt = read_prompt_from_file(prompt_file)

    print("\n--- 正在傳送提示至 Gemini ---")
    print(my_prompt)
    print("--------------------------------")

    # 這是「更新」的過程。
    # 每次都會從 Gemini 獲取最新的回覆。
    gemini_answer = get_gemini_response(my_prompt)

    print("\n--- Gemini 的回覆 ---")
    print(gemini_answer)
    print("-------------------------")
