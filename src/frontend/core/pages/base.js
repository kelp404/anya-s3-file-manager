const React = require('react');
const {
	STORE_KEYS: {IS_API_PROCESSING},
} = require('../constants');
const store = require('../store');

module.exports = class Base extends React.Component {
	state = {
		$isApiProcessing: store.get(IS_API_PROCESSING),
	};

	constructor(props) {
		super(props);
		this.$listens = [];
	}

	componentDidMount() {
		const updateApiProcessingState = isApiProcessing => {
			this.setState(
				({$isApiProcessing}) =>
					$isApiProcessing === isApiProcessing ? null : {$isApiProcessing: isApiProcessing},
			);
		};

		updateApiProcessingState(store.get(IS_API_PROCESSING));
		this.$listens.push(
			store.subscribe(IS_API_PROCESSING, (_, data) => {
				updateApiProcessingState(data);
			}),
		);
	}

	componentWillUnmount() {
		this.$listens.forEach(x => x());
	}
};
