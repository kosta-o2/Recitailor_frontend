import { useState } from "react";
import { Link, useNavigate } from "react-router";
import PageTitle from "../components/mypage/PageTitle";
import PasswordField from "../components/authpage/PasswordField";
import PasswordMatchMessage from "../components/authpage/PasswordMatchMessage";
import FieldMessage from "../components/authpage/FieldMessage";
import DuplicateCheckButton from "../components/authpage/DuplicateCheckButton";
import authStyles from "../components/authpage/Auth.module.css";
import { useAuth } from "../hooks/useAuth";
import { useAuthSubmit } from "../hooks/useAuthSubmit";
import { checkNickname } from "../api/authApi";
import { changePassword, updateNickname } from "../api/mypageApi";
import { validationRules } from "../constants/validationRules";
import { getErrorMessage } from "../utils/getErrorMessage";
import styles from "../components/mypage/MyPage.module.css";

function MyEditPage() {
  const navigate = useNavigate();
  const { member, setMember } = useAuth();
  const [nickname, setNickname] = useState(member.nickname);
  // 닉네임 중복 확인 결과: undefined(미확인) | "ok" | "taken"
  const [nicknameCheck, setNicknameCheck] = useState();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const { submitting, error, setError, submit } = useAuthSubmit(
    "회원정보를 수정하지 못했어요. 다시 시도해주세요.",
  );

  const trimmedNickname = nickname.trim();
  const nicknameChanged = trimmedNickname !== member.nickname;
  const changingPassword = newPassword !== "" || newPasswordConfirm !== "";

  function clearFeedback(name) {
    setSaved(false);
    setError("");
    if (name) setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function handleNicknameChange(event) {
    setNickname(event.target.value);
    setNicknameCheck(undefined);
    clearFeedback("nickname");
  }

  async function handleNicknameCheck() {
    const rule = validationRules.nickname;

    if (!rule.pattern.test(trimmedNickname)) {
      setErrors((prev) => ({ ...prev, nickname: rule.message }));
      return;
    }

    if (!nicknameChanged) {
      setNicknameCheck(undefined);
      setErrors((prev) => ({
        ...prev,
        nickname: "현재 사용 중인 닉네임이에요.",
      }));
      return;
    }

    try {
      const available = await checkNickname(trimmedNickname);
      setNicknameCheck(available ? "ok" : "taken");
      setErrors((prev) => ({ ...prev, nickname: undefined }));
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        nickname: getErrorMessage(err, "중복 확인에 실패했어요."),
      }));
    }
  }

  function validate() {
    const next = {};

    if (nicknameChanged) {
      if (!validationRules.nickname.pattern.test(trimmedNickname)) {
        next.nickname = validationRules.nickname.message;
      } else if (nicknameCheck !== "ok") {
        next.nickname = "닉네임 중복 확인을 해주세요.";
      }
    }

    if (changingPassword) {
      if (!currentPassword) {
        next.currentPassword = "현재 비밀번호를 입력해주세요.";
      }
      if (!validationRules.password.pattern.test(newPassword)) {
        next.newPassword = validationRules.password.message;
      }
      if (newPassword !== newPasswordConfirm) {
        next.newPasswordConfirm = "새 비밀번호가 일치하지 않아요.";
      }
    }

    return next;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaved(false);
    setError("");

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    if (!nicknameChanged && !changingPassword) {
      setError("변경된 내용이 없어요.");
      return;
    }

    await submit(async () => {
      // 비밀번호를 먼저 바꿔서, 현재 비밀번호가 틀리면 아무것도 저장되지 않게 한다.
      if (changingPassword) {
        await changePassword({ currentPassword, newPassword });
        setCurrentPassword("");
        setNewPassword("");
        setNewPasswordConfirm("");
      }

      if (nicknameChanged) {
        const data = await updateNickname(trimmedNickname);
        setMember({ ...member, ...data.member });
        setNickname(data.member.nickname);
        setNicknameCheck(undefined);
      }

      setSaved(true);
    });
  }

  function renderNicknameMessage() {
    if (errors.nickname) {
      return <FieldMessage type="error">{errors.nickname}</FieldMessage>;
    }
    if (nicknameCheck === "taken") {
      return <FieldMessage type="error">이미 사용 중인 닉네임이에요.</FieldMessage>;
    }
    if (nicknameCheck === "ok") {
      return <FieldMessage type="success">사용할 수 있는 닉네임이에요.</FieldMessage>;
    }
    return (
      <span className={styles.help}>
        2~30자로 입력해주세요. 바꾼 경우 중복 확인을 해야 저장할 수 있어요.
      </span>
    );
  }

  return (
    <>
      <PageTitle
        title="회원정보 수정"
        description="닉네임과 비밀번호를 변경할 수 있어요. 바꾸지 않을 항목은 그대로 두세요."
      />

      <form className={styles.card} onSubmit={handleSubmit} noValidate>
        <h2 className={styles.section_title}>기본 정보</h2>

        <div className={styles.row}>
          <label htmlFor="edit-id" className={styles.row_label}>
            아이디
          </label>
          <div className={styles.row_control}>
            <input
              id="edit-id"
              type="text"
              value={member.id}
              disabled
              className={`${authStyles.input} ${styles.input_readonly}`}
            />
            <span className={styles.help}>아이디는 변경할 수 없어요.</span>
          </div>
        </div>

        <div className={styles.row}>
          <label htmlFor="edit-email" className={styles.row_label}>
            이메일
          </label>
          <div className={styles.row_control}>
            <input
              id="edit-email"
              type="email"
              value={member.email}
              disabled
              className={`${authStyles.input} ${styles.input_readonly}`}
            />
            <span className={styles.help}>이메일은 변경할 수 없어요.</span>
          </div>
        </div>

        <div className={styles.divider} aria-hidden="true" />

        <h2 className={styles.section_title}>닉네임 변경</h2>

        <div className={styles.row}>
          <label htmlFor="edit-nickname" className={styles.row_label}>
            닉네임
          </label>
          <div className={styles.row_control}>
            <div className={styles.input_group}>
              <input
                id="edit-nickname"
                type="text"
                autoComplete="nickname"
                maxLength={30}
                value={nickname}
                onChange={handleNicknameChange}
                className={authStyles.input}
              />
              <DuplicateCheckButton onClick={handleNicknameCheck} />
            </div>
            {renderNicknameMessage()}
          </div>
        </div>

        <div className={styles.divider} aria-hidden="true" />

        <div>
          <h2 className={styles.section_title}>비밀번호 변경</h2>
          <p className={styles.hint}>비밀번호를 바꾸지 않으려면 비워두세요.</p>
        </div>

        <div className={styles.row}>
          <label htmlFor="edit-current-password" className={styles.row_label}>
            현재 비밀번호
          </label>
          <div className={styles.row_control}>
            <input
              id="edit-current-password"
              type="password"
              autoComplete="current-password"
              placeholder="현재 비밀번호를 입력하세요"
              value={currentPassword}
              onChange={(event) => {
                setCurrentPassword(event.target.value);
                clearFeedback("currentPassword");
              }}
              className={authStyles.input}
            />
            {errors.currentPassword && (
              <FieldMessage type="error">{errors.currentPassword}</FieldMessage>
            )}
          </div>
        </div>

        <div className={styles.row}>
          <label htmlFor="edit-new-password" className={styles.row_label}>
            새 비밀번호
          </label>
          <div className={styles.row_control}>
            <PasswordField
              id="edit-new-password"
              autoComplete="new-password"
              placeholder="영문, 숫자, 특수문자 포함 8자 이상"
              value={newPassword}
              onChange={(event) => {
                setNewPassword(event.target.value);
                clearFeedback("newPassword");
              }}
              visible={showPassword}
              onToggle={() => setShowPassword((prev) => !prev)}
            />
            {errors.newPassword && (
              <FieldMessage type="error">{errors.newPassword}</FieldMessage>
            )}
          </div>
        </div>

        <div className={styles.row}>
          <label htmlFor="edit-new-password-confirm" className={styles.row_label}>
            새 비밀번호 확인
          </label>
          <div className={styles.row_control}>
            <input
              id="edit-new-password-confirm"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="새 비밀번호를 한 번 더 입력하세요"
              value={newPasswordConfirm}
              onChange={(event) => {
                setNewPasswordConfirm(event.target.value);
                clearFeedback("newPasswordConfirm");
              }}
              className={authStyles.input}
            />
            <PasswordMatchMessage
              password={newPassword}
              confirm={newPasswordConfirm}
            />
          </div>
        </div>

        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}

        {saved && (
          <div role="status" className={styles.saved}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M8 12.5l2.5 2.5L16 9.5" />
            </svg>
            회원정보가 수정되었어요.
          </div>
        )}

        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.button} ${styles.button_secondary}`}
            onClick={() => navigate("/mypage")}
          >
            취소
          </button>
          <button
            type="submit"
            className={`${styles.button} ${styles.button_primary}`}
            disabled={submitting}
          >
            수정 완료
          </button>
        </div>
      </form>

      <div className={styles.footer_note}>
        더 이상 recitailor를 이용하지 않으시나요?
        <Link to="/mypage/withdraw">회원탈퇴</Link>
      </div>
    </>
  );
}

export default MyEditPage;
