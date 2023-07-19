import { Formik, Field } from "formik";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setLogin } from "state";

const loginSchema = yup.object().shape({
	email: yup.string().email("Invalid email").required("Required"),
	password: yup.string().required("Required"),
});

const initialValues = {
	email: "",
	password: "",
};

const LoginForm = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const login = async (values, onSubmitProps) => {
		const loggedInResponse = await fetch("http://localhost:3001/auth/login", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(values),
		});
		const loggedIn = await loggedInResponse.json();
		onSubmitProps.resetForm();
		if (loggedIn) {
			dispatch(
				setLogin({
					user: loggedIn.user,
					token: loggedIn.token,
				})
			);
			navigate("/dashboard");
		}
	};

	return (
		<Formik
			onSubmit={login}
			initialValues={initialValues}
			validationSchema={loginSchema}>
			{({
				values,
				errors,
				touched,
				handleBlur,
				handleChange,
				handleSubmit,
			}) => (
				<form onSubmit={handleSubmit} className="tinder-form">
					<div className="form-content">
						<div className="form-group">
							<label htmlFor="email">Email address:</label>
							<Field
								type="text"
								name="email"
								className="tinder-input"
								onBlur={handleBlur}
								onChange={handleChange}
								value={values.email}
							/>
						</div>

						<div className="form-group">
							<label htmlFor="password">Password:</label>
							<Field
								type="password"
								name="password"
								className="tinder-input"
								onBlur={handleBlur}
								onChange={handleChange}
								value={values.password}
							/>
						</div>

						<h5>Click continue to log in:</h5>
						<button className="continue-button" type="submit">
							Continue
						</button>
					</div>
				</form>
			)}
		</Formik>
	);
};

export default LoginForm;
