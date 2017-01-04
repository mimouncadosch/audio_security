###README

## Real-time Detection and Recognition of Environmental Sounds.

See the PDF report for an in-depth explanation of the system.

The application is structured in the following directories:

```
img/...........................images used for displaying the sounds detected

js/
	index.js...................sound processing, feature extraction, DOM manipulation
	svm_trainer.js.............training data and SVM classifier

libs/
	meyda.min.js..............library used for feature extraction
	svm.js....................library used for support vector machine classification

training_data_audio/..........training data used in audio format

training_data_numerical/......numerical features extracted from audio data

get_audio.py..................python script to download Youtube videos

index.html....................main program interface

styles.css...................css
```
