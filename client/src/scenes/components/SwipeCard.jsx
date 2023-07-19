import React from "react";
import { useSpring, animated } from "react-spring";

const width = window.innerWidth;

const settings = {
	maxTilt: 45,
	swipeThreshold: 0.2 * width,
};

const physics = {
	touchResponsive: {
		friction: 50,
		tension: 2000,
	},
	animate: {
		friction: 30,
		tension: 200,
	},
};

const normalize = (vector) => {
	const length = Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
	return { x: vector.x / length, y: vector.y / length };
};

const animateOut = async (gesture, setSpringTarget) => {
	const finalX = width * gesture.x;
	const finalRotation = gesture.x * 70;

	return await new Promise((resolve) => {
		setSpringTarget.start({
			xyrot: [finalX, 0, finalRotation],
			config: physics.animate,
			onRest: resolve,
		});
	});
};

const animateBack = (setSpringTarget) => {
	return new Promise((resolve) => {
		setSpringTarget.start({
			xyrot: [0, 0, 0],
			config: physics.animate,
			onRest: resolve,
		});
	});
};

const getSwipeDirection = (prop) => {
	if (prop.x > settings.swipeThreshold) {
		return "right";
	} else if (prop.x < -settings.swipeThreshold) {
		return "left";
	}
	return "none";
};

const AnimatedDiv = animated.div;

const SwipeCard = React.forwardRef(
	({ children, onSwipe, onDrag, className }, ref) => {
		const [{ xyrot }, setSpringTarget] = useSpring(() => ({
			xyrot: [0, 0, 0],
			config: physics.touchResponsive,
		}));

		React.useImperativeHandle(ref, () => ({
			async swipe(dir = "right") {
				const power = 1.6;
				const disturbance = (Math.random() - 0.5) / 2;
				if (dir === "right") {
					await animateOut({ x: power, y: disturbance }, setSpringTarget);
				} else if (dir === "left") {
					await animateOut({ x: -power, y: disturbance }, setSpringTarget);
				}
				if (onSwipe) onSwipe(dir);
			},
		}));

		const handleSwipeReleased = React.useCallback(
			async (setSpringTarget, gesture) => {
				const dir = getSwipeDirection(gesture);
				if (dir !== "none") {
					await animateOut(normalize(gesture), setSpringTarget);
					if (onSwipe) onSwipe(dir);
					return;
				}
				animateBack(setSpringTarget);
			},
			[onSwipe]
		);

		const gestureStateFromWebEvent = (ev, startPosition) => {
			let x = ev.clientX - startPosition.x;
			let y = ev.clientY - startPosition.y;

			const gestureState = { x, y };
			return gestureState;
		};

		React.useLayoutEffect(() => {
			let startPosition = { x: 0, y: 0 };
			let isClicking = false;

			element.current.addEventListener("mousedown", (ev) => {
				isClicking = true;
				startPosition = { x: ev.clientX, y: ev.clientY };
			});

			const handleMove = (gestureState) => {
				let rot = gestureState.x * 0.05;
				rot = Math.max(Math.min(rot, settings.maxTilt), -settings.maxTilt);
				setSpringTarget.start({
					xyrot: [gestureState.x, gestureState.y, rot],
					config: physics.touchResponsive,
				});
			};

			window.addEventListener("mousemove", (ev) => {
				if (!isClicking) return;
				const gestureState = gestureStateFromWebEvent(ev, startPosition);
				if (onDrag) onDrag(isClicking);
				handleMove(gestureState);
			});

			window.addEventListener("mouseup", (ev) => {
				if (!isClicking) return;
				isClicking = false;
				const gestureState = gestureStateFromWebEvent(ev, startPosition);
				if (onDrag) onDrag(isClicking);
				handleSwipeReleased(setSpringTarget, gestureState);
				startPosition = { x: 0, y: 0 };
			});
		});

		const element = React.useRef();

		return React.createElement(AnimatedDiv, {
			ref: element,
			className,
			style: {
				transform: xyrot.to(
					(x, y, rot) => `translate3d(${x}px, ${y}px, 0px) rotate(${rot}deg)`
				),
			},
			children,
		});
	}
);

export default SwipeCard;
