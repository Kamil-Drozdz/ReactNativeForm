import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'react-native-image-picker';

interface ContractorFormProps {
	onSubmit: (data: ContractorData) => void;
}

interface ContractorData {
	firstName: string;
	lastName: string;
	type: string;
	idNumber: string;
	image: string;
}
interface response {
	didCancel?: boolean;
	errorCode?: string;
	errorMessage?: string;
	assets?: [] | any;
	uri?: string;
}

const ContractorForm: React.FC<ContractorFormProps> = () => {
	const [formState, setFormState] = useState<ContractorData>({
		firstName: '',
		lastName: '',
		type: 'Osoba',
		idNumber: '',
		image: '',
	});

	const handleFormChange = (key: string, value: string) => {
		setFormState({ ...formState, [key]: value });
	};

	const handleImageChange = (uri: string) => {
		setFormState({ ...formState, image: uri });
	};

	const handleSubmit = async () => {
		const { idNumber, type } = formState;
		if (!validateIdNumber(idNumber, type)) {
			alert('Nieprawidłowy numer identyfikacyjny');
			return;
		}
		if (!validateImage(formState.image)) {
			alert('Nieprawidłowy format zdjęcia lub nieprawidłowe proporcje');
			return;
		}
		try {
			const response = await fetch('https://localhost:60001/Contractor/Save', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(formState),
			});
			if (response.status === 200) {
				alert('Zapisano');
			} else if (response.status === 404) {
				alert('Nie znaleziono metody zapisu');
			} else {
				alert('Wystąpił błąd');
			}
		} catch (error) {
			alert('Wystąpił błąd');
		}
	};

	const validateIdNumber = (idNumber: string, type: string): boolean => {
		if (type === 'Osoba') {
			// Validate PESEL
			const peselRegex = /^[0-9]{11}$/;
			return peselRegex.test(idNumber);
		} else {
			// Validate NIP
			const nipRegex = /^[0-9]{10}$/;
			return nipRegex.test(idNumber);
		}
	};

	const validateImage = async (uri: string): Promise<boolean> => {
		const extension = uri.split('.').pop()?.toLowerCase();
		if (extension !== 'jpg' && extension !== 'jpeg') {
			return false;
		}

		const imageRatio: any = await getImageRatio(uri);
		if (imageRatio !== 1) {
			return false;
		}

		return true;
	};

	const getImageRatio = (uri: string): Promise<number> => {
		return new Promise((resolve, reject) => {
			Image.getSize(
				uri,
				(width, height) => {
					const ratio = width / height;
					resolve(ratio);
				},
				error => {
					reject(error);
				}
			);
		});
	};
	interface styles {
		style?: object;
	}

	const styles = StyleSheet.create({
		container: {
			marginTop: 100,
			flex: 1,
			padding: 16,
			alignItems: 'center',
		},
		input: {
			height: 50,
			width: '90%',
			marginVertical: 8,
			paddingHorizontal: 8,
			borderWidth: 1,
			borderColor: '#ccc',
			borderRadius: 8,
		},
		imagePreview: {
			marginVertical: 16,
			width: 150,
			height: 150,
			borderRadius: 75,
		},
		errorText: {
			color: 'red',
			marginVertical: 8,
		},
		button: {
			marginVertical: 16,
		},
	});

	return (
		<>
			<View style={styles.container}>
				<TextInput
					style={styles.input}
					placeholder='Imię'
					value={formState.firstName}
					onChangeText={text => handleFormChange('firstName', text)}
				/>
				<TextInput
					style={styles.input}
					placeholder='Nazwisko'
					value={formState.lastName}
					onChangeText={text => handleFormChange('lastName', text)}
				/>
				<View style={styles.input}>
					<Picker
						selectedValue={formState.type}
						onValueChange={(itemValue: string) => handleFormChange('type', itemValue)}>
						<Picker.Item label='Osoba' value='Osoba' />
						<Picker.Item label='Firma' value='Firma' />
					</Picker>
				</View>
				<TextInput
					style={styles.input}
					placeholder={formState.type === 'Osoba' ? 'PESEL' : 'NIP'}
					value={formState.idNumber}
					onChangeText={text => handleFormChange('idNumber', text)}
					keyboardType='numeric'
				/>
				{formState.image ? <Image style={styles.imagePreview} source={{ uri: formState.image }} /> : null}
				<Button
					title='Wybierz zdjęcie'
					onPress={() =>
						(ImagePicker as any).launchImageLibrary(
							{
								mediaType: 'photo',
								includeBase64: false,
								maxHeight: 200,
								maxWidth: 200,
							},
							(response: response) => {
								if (!response.didCancel && !response.errorMessage) {
									handleImageChange(response.assets[0].uri);
								}
							}
						)
					}
				/>
				<View style={styles.button}>
					<Button title='Zapisz' onPress={handleSubmit} />
				</View>
			</View>
		</>
	);
};

export default ContractorForm;
